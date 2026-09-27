# Iverson — a J.A.R.V.I.S.-inspired personal AI agent

Iverson is a Tony Stark–style AI assistant with a holographic HUD, voice
input/output, a wake word ("Hey Iverson"), a live camera feed with motion
detection, and a pluggable brain that works fully offline out of the box and
can be upgraded with a real language model (OpenAI-compatible API) at any
time.

It's built as an **installable Progressive Web App (PWA)** so a single
codebase can run as a "desktop agent" on macOS (Safari/Chrome → *Add to
Dock*) and Android (Chrome → *Install app* / *Add to Home screen*), in
addition to running live in any browser. This avoids needing separate native
Xcode/Android Studio builds while still giving you a standalone app window,
an app icon, and offline support once installed.

## Features

- 🎙️ **Voice in/out** — press-to-talk mic button (Web Speech API) plus
  spoken replies (speech synthesis).
- 👂 **Wake word** — say "Hey Iverson" (or just "Iverson") to trigger
  listening hands-free, once enabled in Settings.
- 💬 **Text chat** — a comms-log style chat panel always available, no mic
  required.
- 🧠 **Pluggable brain** — a built-in offline command engine (time/date,
  jokes, notes, calculator, system diagnostics, device toggles, etc.) that
  instantly escalates to a real LLM (OpenAI-compatible endpoint) the moment
  you add an API key in Settings. No key required to try it.
- 📷 **Camera + motion detection** — turn on the optical sensor and Iverson
  will watch the feed and raise an alert (spoken + logged) when it detects
  motion, using lightweight canvas frame-diffing (no heavy ML dependency).
- 🖥️ **Iron-Man-style HUD** — animated arc-reactor core, scanlines, system
  diagnostics bars, glowing cyan/amber sci-fi styling.
- 📱 **Installable PWA** — add it to your home screen / dock on macOS or
  Android for a native-app feel, works offline once cached.

## Project structure

```
app/                     Vite + React + TypeScript + Tailwind PWA
  src/
    components/          HUD, chat, camera, settings UI
    hooks/useVoicePipeline.ts   Wake word + push-to-talk speech recognition
    lib/                 brain.ts (LLM + local command routing), commands.ts,
                          speech.ts, motion.ts, storage.ts
    store/useIverson.ts  Global app state (zustand)
```

## Running locally

```bash
cd app
npm install
npm run dev       # http://localhost:5173
```

Build for production / PWA:

```bash
npm run build
npm run preview
```

## Connecting a real language model

Open the ⚙️ Settings panel in the app and paste an OpenAI-compatible API
key. The key is stored only in your browser's local storage and sent
directly to the configured API endpoint — nothing passes through any other
server. Leave it blank to keep using the free, fully offline command engine.

## Installing as an app

- **Android (Chrome):** menu → *Install app* / *Add to Home screen*.
- **macOS (Safari or Chrome):** File/Share menu → *Add to Dock*.

Once installed, Iverson opens in its own window with its own icon, exactly
like a native desktop/mobile agent.
