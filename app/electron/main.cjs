// Desktop shell for Iverson: loads the built web app (dist/) in a native window.
const { app, BrowserWindow, session, shell, systemPreferences } = require("electron");
const path = require("node:path");

const ALLOWED_PERMISSIONS = new Set(["media", "geolocation", "notifications", "clipboard-sanitized-write"]);

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    title: "Iverson",
    backgroundColor: "#02060b",
    autoHideMenuBar: true,
    icon: path.join(__dirname, "..", "dist", "icons", "icon-512.png"),
    webPreferences: { contextIsolation: true, sandbox: true },
  });

  win.loadFile(path.join(__dirname, "..", "dist", "index.html"));

  // Links such as "Get a key" open in the user's browser, not inside the app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(() => {
  // Camera, microphone and location for the camera panel, voice and weather.
  session.defaultSession.setPermissionRequestHandler(async (_wc, permission, callback, details) => {
    if (!ALLOWED_PERMISSIONS.has(permission)) return callback(false);
    // macOS also needs its own system-level consent for the microphone and camera.
    if (permission === "media" && process.platform === "darwin") {
      const types = details.mediaTypes ?? [];
      for (const type of types) {
        const kind = type === "video" ? "camera" : "microphone";
        if (systemPreferences.getMediaAccessStatus(kind) !== "granted") {
          const ok = await systemPreferences.askForMediaAccess(kind).catch(() => false);
          if (!ok) return callback(false);
        }
      }
    }
    callback(true);
  });
  session.defaultSession.setPermissionCheckHandler((_wc, permission) => ALLOWED_PERMISSIONS.has(permission));

  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
