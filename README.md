# 👻 Go Stealth — Undetectable AI Interview Copilot

**Go Stealth** is a premium, professional-grade designed for high-stakes environments where privacy and undetectability are paramount. It combines advanced screen analysis, real-time speech-to-text, and state-of-the-art Large Language Models (LLMs) within a beautiful, glassmorphic interface that remains completely invisible to monitoring software.

---

## 🌟 Key Features

- **Hardware-Level Stealth**: Uses Windows DWM Affinity APIs (`WDA_EXCLUDEFROMCAPTURE`) to ensure the application window is invisible to screenshots, video recordings, OBS, and proctoring software.
- **AI Vision**: Analyze any part of your screen instantly to extract questions, code, or diagrams.
- **Real-Time Transcription**: Listen to interviewer audio via your microphone and get instant transcripts for analysis.
- **Multi-Provider Support**: Choose between Groq, Google Gemini, Mistral, OpenAI, and Deepgram.
- **Glassmorphic UI**: A modern, transparent design that stays always-on-top without being intrusive.
- **Panic Hotkeys**: Instantly hide/show the interface or trigger analysis using global keyboard shortcuts.

---

## 🛠 Setup & Configuration

To use Go Stealth, you need to provide your own API keys for the AI services you wish to use.

### 1. Configure API Keys
1. Launch the application.
2. Click the **Gear Icon (⚙)** in the top bar to open Settings.
3. Paste your API keys into the corresponding sections.
4. Click **"Test Connection"** to verify the keys are valid.
5. Click **"Save All Settings"**.

### 2. Where to get API Keys
Go Stealth supports several free and paid providers:

| Provider | Purpose | Get Key Here |
| :--- | :--- | :--- |
| **Groq** | Ultra-fast Vision & Chat (Free tier available) | [console.groq.com](https://console.groq.com/keys) |
| **Google Gemini** | Advanced Vision & Reasoning (Free tier) | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| **Mistral AI** | Open-source High Performance Models | [console.mistral.ai](https://console.mistral.ai/api-keys/) |
| **Deepgram** | Premium Real-time Audio Transcription | [console.deepgram.com](https://console.deepgram.com/) |
| **OpenAI** | GPT-4o Vision & Reasoning | [platform.openai.com](https://platform.openai.com/api-keys) |

---

## 🚀 How to Use

### Screen Analysis (AI Vision)
1. Select your target **Screen or Window** from the dropdown menu in the status bar.
2. Click **"Capture Screen"** or press `Alt + Shift + C`.
3. The AI will analyze the visual content and stream the answer into the output box.

### Audio Transcription (Listen)
1. Click **"Listen"** or press `Alt + Shift + L`.
2. The app will begin transcribing audio from your microphone.
3. Click **"Stop"** or click **"Analyze"** to send the transcript to the AI for a response.

### Stealth Controls
- **Be Visible Toggle**: Located in the footer. Turn this **ON** if you want to include the app window in your own recordings/screenshots. Keep it **OFF** for maximum privacy.
- **Show in Taskbar**: Toggle whether the app appears in your Windows taskbar.
- **Panic Key**: Press `Alt + Shift + S` to instantly toggle the visibility of the entire interface.

---

## ⌨️ Global Hotkeys

| Shortcut | Action |
| :--- | :--- |
| `Alt + Shift + C` | **Capture & Analyze**: Take a screenshot of the selected source and generate an answer. |
| `Alt + Shift + L` | **Listen Toggle**: Start/Stop microphone transcription. |
| `Alt + Shift + S` | **Stealth Toggle**: Instantly hide/show the UI from your own monitor. |
| `Ctrl + Shift + X` | **Clear**: Wipe all current answers and transcripts. |

---

## 🔒 Privacy & Safety

Go Stealth is designed with a "Privacy First" architecture:
- **Local Storage**: Your API keys are encrypted and stored locally on your machine.
- **No Analytics**: We do not track your usage or collect your data.
- **Hardware Masking**: Unlike simple "Always on Top" apps, Go Stealth uses kernel-level window flags to ensure it never leaks into screen shares.

---

*Developed by [RiddleTech](https://riddletech.co.ke)*
