const { app, BrowserWindow, dialog, ipcMain, Tray } = require("electron");
app.setAppUserModelId(process.execPath);

// A global variable can be accessed by other processes
global.APP_TITLE = "Simple Audio Player";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    },
    title: global.APP_TITLE
  });

  // and load the index.html of the app.
  win.loadFile("audioplayer.html");

  // Open the DevTools.
  win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
}

let tray;
function setUpTray() {
  tray = new Tray("assets/favicon-32x32.png");
  tray.setToolTip("Simple Audio Player.");
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createWindow();
  setUpTray();
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
async function getAudioFilePath() {
  return new Promise((resolve, reject) => {
    dialog
      .showOpenDialog({
        properties: ["openFile"],
        filters: [
          {
            name: "Audio",
            extensions: ["mp3", "ogg", "wav"]
          }
        ]
      })
      .then(result => {
        if (result.canceled) {
          reject("User cancelled action");
        } else {
          resolve(result.filePaths[0]);
        }
      })
      .catch(err => reject(err));
  });
}

ipcMain.handle("getAudioFilePath", async () => {
  return await getAudioFilePath();
});

ipcMain.handle("showSongTitleBalloon", (_event, songName) => {
  tray.displayBalloon({
    icon: "assets/favicon-32x32.png",
    title: "Simple Audio Player",
    content: "Currently playing: " + songName
  });
});
