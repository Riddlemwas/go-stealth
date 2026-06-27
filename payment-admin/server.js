/**
 * server.js — Go Stealth Payment Backend
 * Handles: M-Pesa Daraja Integration (STK Push), Callbacks, Subscription Checks
 */

const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Trailing slashes are handled directly in the route registration arrays to prevent redirect loops.

// ─── CONFIGURATION (Fill these with your Daraja details) ──────────────────
const CONFIG = {
  CONSUMER_KEY: 'YOUR_CONSUMER_KEY',
  CONSUMER_SECRET: 'YOUR_CONSUMER_SECRET',
  SHORTCODE: 'YOUR_SHORTCODE',
  PASSKEY: 'YOUR_PASSKEY',
  CALLBACK_URL: 'https://payments.riddletech.co.ke/api/callback',
  SECRET_FILE: path.join(__dirname, 'secret.json'),
  DATA_FILE: path.join(__dirname, 'transactions.json'),
  KEYS_FILE: path.join(__dirname, 'keys.json')
};

// ─── ADMIN AUTH LOGIC ─────────────────────────────────────────────────────
const getSecret = () => {
  if (!fs.existsSync(CONFIG.SECRET_FILE)) {
    fs.writeFileSync(CONFIG.SECRET_FILE, JSON.stringify({ password: 'RiddleTech3311@#' }, null, 2));
  }
  return JSON.parse(fs.readFileSync(CONFIG.SECRET_FILE, 'utf8')).password;
};

// ─── UTILS ────────────────────────────────────────────────────────────────
const getTimestamp = () => {
  const now = new Date();
  return now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0');
};

const getAccessToken = async () => {
  const auth = Buffer.from(`${CONFIG.CONSUMER_KEY}:${CONFIG.CONSUMER_SECRET}`).toString('base64');
  const res = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    headers: { Authorization: `Basic ${auth}` }
  });
  return res.data.access_token;
};

// ─── API ENDPOINTS ────────────────────────────────────────────────────────

/**
 * Admin Login
 */
app.post(['/api/admin/login', '/api/admin/login/'], (req, res) => {
  const { password } = req.body;
  if (password === getSecret()) {
    res.json({ success: true, token: 'GS_ADMIN_' + Date.now() });
  } else {
    res.status(401).json({ success: false, error: 'Unauthorized' });
  }
});

/**
 * Admin: Generate License Key
 */
app.post(['/api/admin/generate-key', '/api/admin/generate-key/'], (req, res) => {
  const { password, days, targetHwid } = req.body;
  if (password !== getSecret()) return res.status(401).json({ success: false });

  // Generate a random token
  const key = 'GS-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  const keys = JSON.parse(fs.readFileSync(CONFIG.KEYS_FILE, 'utf8') || '[]');
  
  keys.push({
    key,
    days: parseInt(days),
    targetHwid, // Locked to this Machine ID
    redeemedBy: null,
    redeemedAt: null,
    createdAt: new Date().toISOString()
  });
  
  fs.writeFileSync(CONFIG.KEYS_FILE, JSON.stringify(keys, null, 2));
  res.json({ success: true, key });
});

/**
 * User: Redeem License Key
 */
app.post(['/api/redeem-key', '/api/redeem-key/'], (req, res) => {
  const { key, hwid } = req.body;
  if (!key || !hwid) {
    return res.status(400).json({ success: false, error: 'Missing key or Machine ID (HWID)' });
  }
  const keys = JSON.parse(fs.readFileSync(CONFIG.KEYS_FILE, 'utf8') || '[]');
  
  // Find key and verify targetHwid
  const index = keys.findIndex(k => k.key === key && k.targetHwid === hwid);

  if (index === -1) {
    return res.status(400).json({ success: false, error: 'Invalid key, or not for this Machine ID' });
  }

  const keyData = keys[index];

  // If already redeemed, check if it was redeemed by the same HWID
  if (keyData.redeemedBy && keyData.redeemedBy !== hwid) {
    return res.status(400).json({ success: false, error: 'Key has already been redeemed by another Machine ID' });
  }

  // If never redeemed, set redeemedBy and redeemedAt
  let isReactivation = false;
  if (!keyData.redeemedBy) {
    keys[index].redeemedBy = hwid;
    keys[index].redeemedAt = new Date().toISOString();
    fs.writeFileSync(CONFIG.KEYS_FILE, JSON.stringify(keys, null, 2));
  } else {
    isReactivation = true;
  }

  // Calculate remaining days
  const subDate = new Date(keys[index].redeemedAt);
  const expiry = new Date(subDate);
  expiry.setDate(subDate.getDate() + keys[index].days);
  const remainingMs = expiry - new Date();
  const remainingDays = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));

  res.json({ 
    success: true, 
    days: keys[index].days,
    remainingDays,
    message: isReactivation 
      ? `Key successfully reactivated! ${remainingDays} days remaining.` 
      : `Congratulations! Key redeemed successfully for ${keys[index].days} days.`
  });
});

/**
 * Admin: Get All Transactions
 */
app.get(['/api/admin/transactions', '/api/admin/transactions/'], (req, res) => {
  // In production, verify auth token or password
  const transactions = JSON.parse(fs.readFileSync(CONFIG.DATA_FILE, 'utf8') || '[]');
  res.json(transactions);
});

/**
 * Admin: Get All Keys
 */
app.get(['/api/admin/keys', '/api/admin/keys/'], (req, res) => {
  const keys = JSON.parse(fs.readFileSync(CONFIG.KEYS_FILE, 'utf8') || '[]');
  res.json(keys);
});

/**
 * Trigger STK Push
 * POST /api/stkpush
 */
app.post(['/api/stkpush', '/api/stkpush/'], async (req, res) => {
  try {
    const { phone, amount, hwid, plan } = req.body;
    const token = await getAccessToken();
    const timestamp = getTimestamp();
    const password = Buffer.from(CONFIG.SHORTCODE + CONFIG.PASSKEY + timestamp).toString('base64');

    const data = {
      BusinessShortCode: CONFIG.SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone, // e.g. 254712345678
      PartyB: CONFIG.SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: CONFIG.CALLBACK_URL,
      AccountReference: 'Go Stealth Sub',
      TransactionDesc: `Subscription for ${hwid}`
    };

    const response = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', data, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Save pending transaction
    const transactions = JSON.parse(fs.readFileSync(CONFIG.DATA_FILE, 'utf8') || '[]');
    transactions.push({
      id: response.data.CheckoutRequestID,
      hwid,
      phone,
      amount,
      plan,
      status: 'Pending',
      date: new Date().toISOString()
    });
    fs.writeFileSync(CONFIG.DATA_FILE, JSON.stringify(transactions, null, 2));

    res.json({ success: true, checkoutId: response.data.CheckoutRequestID });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * Admin: Revoke Subscription / License Key
 * POST /api/admin/revoke
 */
app.post(['/api/admin/revoke', '/api/admin/revoke/'], (req, res) => {
  try {
    const { password, hwid, key } = req.body;
    if (password !== getSecret()) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!hwid) {
      return res.status(400).json({ success: false, error: 'Missing HWID' });
    }

    // 1. Remove all successful transactions for this HWID to clear subscription status
    let transactions = JSON.parse(fs.readFileSync(CONFIG.DATA_FILE, 'utf8') || '[]');
    const originalLength = transactions.length;
    transactions = transactions.filter(t => t.hwid !== hwid);
    fs.writeFileSync(CONFIG.DATA_FILE, JSON.stringify(transactions, null, 2));

    // 2. Remove or reset any keys redeemed by or target-assigned to this HWID
    let keys = JSON.parse(fs.readFileSync(CONFIG.KEYS_FILE, 'utf8') || '[]');
    keys = keys.filter(k => k.targetHwid !== hwid && k.redeemedBy !== hwid);
    fs.writeFileSync(CONFIG.KEYS_FILE, JSON.stringify(keys, null, 2));

    res.json({ 
      success: true, 
      message: `Successfully revoked all access and cleared subscriptions/keys associated with HWID: ${hwid}` 
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * M-Pesa Callback
 * POST /api/callback
 */
app.post(['/api/callback', '/api/callback/'], (req, res) => {
  const result = req.body.Body.stkCallback;
  const transactions = JSON.parse(fs.readFileSync(CONFIG.DATA_FILE, 'utf8') || '[]');
  const index = transactions.findIndex(t => t.id === result.CheckoutRequestID);

  if (index !== -1) {
    if (result.ResultCode === 0) {
      transactions[index].status = 'Success';
      transactions[index].receipt = result.CallbackMetadata.Item[1].Value;
    } else {
      transactions[index].status = 'Failed';
      transactions[index].reason = result.ResultDesc;
    }
    fs.writeFileSync(CONFIG.DATA_FILE, JSON.stringify(transactions, null, 2));
  }

  res.status(200).send('OK');
});

/**
 * Check Subscription Status
 * GET /api/check-subscription?hwid=...
 */
app.get(['/api/check-subscription', '/api/check-subscription/'], (req, res) => {
  const { hwid } = req.query;
  if (!hwid) {
    return res.status(400).json({ success: false, error: 'Missing Machine ID (HWID)' });
  }
  const transactions = JSON.parse(fs.readFileSync(CONFIG.DATA_FILE, 'utf8') || '[]');
  const keys = JSON.parse(fs.readFileSync(CONFIG.KEYS_FILE, 'utf8') || '[]');
  
  let latestExpiry = null;
  let activePlanName = '';

  // 1. Process all successful transactions for this HWID (M-Pesa, PayPal, etc.)
  const userTx = transactions.filter(t => t.hwid === hwid && t.status === 'Success');
  userTx.forEach(t => {
    const subDate = new Date(t.date);
    const expiry = new Date(subDate);
    const planLabel = t.plan || 'Subscription';
    
    if (planLabel.includes('2 Weeks')) expiry.setDate(subDate.getDate() + 14);
    else if (planLabel.includes('1 Month')) expiry.setMonth(subDate.getMonth() + 1);
    else if (planLabel.includes('3 Months')) expiry.setMonth(subDate.getMonth() + 3);
    else if (planLabel.includes('Annual')) expiry.setFullYear(subDate.getFullYear() + 1);
    else if (planLabel.includes('Lifetime')) expiry.setFullYear(subDate.getFullYear() + 100);

    if (!latestExpiry || expiry > latestExpiry) {
      latestExpiry = expiry;
      activePlanName = planLabel;
    }
  });

  // 2. Process all redeemed license keys for this HWID
  const userKeys = keys.filter(k => k.redeemedBy === hwid && k.redeemedAt);
  userKeys.forEach(k => {
    const subDate = new Date(k.redeemedAt);
    const expiry = new Date(subDate);
    expiry.setDate(subDate.getDate() + k.days);

    const planLabel = `${k.days} Days License`;

    if (!latestExpiry || expiry > latestExpiry) {
      latestExpiry = expiry;
      activePlanName = planLabel;
    }
  });

  if (latestExpiry) {
    const isExpired = new Date() > latestExpiry;
    res.json({ 
      subscribed: !isExpired, 
      expiry: latestExpiry.toISOString(),
      message: !isExpired 
        ? `Subscribed until ${latestExpiry.toLocaleDateString()} (${activePlanName})` 
        : `Subscription expired (${activePlanName})`
    });
  } else {
    res.json({ subscribed: false });
  }
});

// Serve Admin UI (Serve the folder where this script is located)
app.use(express.static(__dirname));

// Health Check
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


// Init Data Files
if (!fs.existsSync(CONFIG.DATA_FILE)) fs.writeFileSync(CONFIG.DATA_FILE, '[]');
if (!fs.existsSync(CONFIG.KEYS_FILE)) fs.writeFileSync(CONFIG.KEYS_FILE, '[]');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Payment server running on port ${PORT}`));
