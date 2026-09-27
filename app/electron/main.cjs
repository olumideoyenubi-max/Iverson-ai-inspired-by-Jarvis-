// Desktop shell for Iverson: loads the built web app (dist/) in a native window.
const { app, BrowserWindow, session, shell } = require("electron");
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
  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) =>
    callback(ALLOWED_PERMISSIONS.has(permission))
  );
  session.defaultSession.setPermissionCheckHandler((_wc, permission) => ALLOWED_PERMISSIONS.has(permission));

  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
