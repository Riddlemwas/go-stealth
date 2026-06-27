#define MyAppName "Go Stealth"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "RiddleTech"
#define MyAppURL "https://riddletech.co.ke"
#define MyAppExeName "Go Stealth.exe"

[Setup]
; NOTE: The value of AppId uniquely identifies this application. Do not use the same AppId value in installers for other applications.
AppId={{D3F95B72-7F3A-4D78-BC84-F84D0AEAC123}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
UninstallDisplayIcon={app}\{#MyAppExeName}
; "ArchitecturesAllowed=x64" specifies that the installer will only run on 64-bit Windows.
ArchitecturesAllowed=x64
; "ArchitecturesInstallIn64BitMode=x64" requests that the install be done in "64-bit mode" on x64.
ArchitecturesInstallIn64BitMode=x64
DisableProgramGroupPage=yes
; Run in administrative install mode (install for all users)
PrivilegesRequired=admin
OutputDir=C:\Users\RiDDL3TeCH\Desktop\DevProjects\Go stealth Project\dist
OutputBaseFilename=Go_Stealth_Setup
SetupIconFile=C:\Users\RiDDL3TeCH\Desktop\DevProjects\Go stealth Project\dist\.icon-ico\icon.ico
InfoBeforeFile=C:\Users\RiDDL3TeCH\Desktop\DevProjects\Go stealth Project\README.txt
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "C:\Users\RiDDL3TeCH\Desktop\DevProjects\Go stealth Project\dist\win-unpacked\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion
Source: "C:\Users\RiDDL3TeCH\Desktop\DevProjects\Go stealth Project\dist\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "C:\Users\RiDDL3TeCH\Desktop\DevProjects\Go stealth Project\README.txt"; DestDir: "{app}"; Flags: isreadme

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
