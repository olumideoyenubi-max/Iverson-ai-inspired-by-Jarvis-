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
