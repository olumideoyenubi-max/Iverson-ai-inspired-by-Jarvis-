# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## iOS (Xcode)

The native iOS project lives in `ios/`. Open **`ios/App/App.xcodeproj`** in Xcode, pick a simulator or device, and press Run. Swift Package Manager pulls in Capacitor automatically (no CocoaPods).

After changing the web code, rebuild and copy it into the iOS project:

```bash
npm install
npm run ios   # build → cap sync ios → open Xcode
```

## AI replies (ChatGPT, Claude, Gemini, Groq)

Open **Settings → Language model**, pick a provider, paste its API key:

| Provider | Cost | Get a key |
|---|---|---|
| ChatGPT (OpenAI) | Paid per use | https://platform.openai.com/api-keys |
| Claude (Anthropic) | Paid per use | https://console.anthropic.com/settings/keys |
| Google Gemini | Free tier | https://aistudio.google.com/apikey |
| Groq | Free tier | https://console.groq.com/keys |
| Custom | — | Any OpenAI-compatible `/chat/completions` endpoint |

Keys stay on the device and go straight to the provider. Without a key, Iverson still answers its built-in commands.

## Desktop (Mac, Windows, Linux) and Android

| Platform | Run it | Build it yourself |
|---|---|---|
| **Mac** | Unzip `Iverson-…-mac-apple-silicon.zip` (M1–M4) or `…-mac-intel.zip`, drag **Iverson** to Applications. First launch: right-click → **Open** (the app isn't notarized). | `npm run dist:mac` |
| **Windows** | Run the installer, or unzip `Iverson-…-win.zip` and open `Iverson.exe`. SmartScreen may warn: **More info → Run anyway**. | `npm run dist:win` |
| **Linux** | `chmod +x Iverson-….AppImage` then run it. | `npm run dist:linux` |
| **Android** | Install the APK, or open `android/` in Android Studio and press Run. | `npm run android` |
| **iPhone** | Open `ios/App/App.xcodeproj` in Xcode and press Run. | `npm run ios` |

`npm run desktop` builds and opens the desktop app straight away for testing.

**Automatic builds:** the *Build apps* GitHub workflow builds every platform in the cloud. Open the repo's **Actions** tab → *Build apps* → **Run workflow**, then download the installers from the run's **Artifacts**.

Voice input uses the browser's speech recognition, which the desktop app and the Android app don't have. There, type to Iverson instead; spoken replies still work.
