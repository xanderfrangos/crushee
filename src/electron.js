const { app, BrowserWindow, ipcMain, systemPreferences, Menu, MenuItem, Notification } = require('electron')
const path = require("path")
const fs = require("fs")
const { fork } = require("child_process")
const isDev = require("electron-is-dev");
let mainWindow
let splashWindow

// App version
const crusheeVersion = require('../package.json').version

function createSplash() {
  splashWindow = new BrowserWindow({
    width: 320,
    height: 320,
    icon: __dirname + '/assets/icon-shadow.ico',
    title: 'Crushee',
    show: false,
    frame: false,
    transparent: true,
    webPreferences: {
      navigateOnDragDrop: false,
      webSecurity: false,
      scrollBounce: true,
      experimentalFeatures: true,
    },
    titleBarStyle: "default"
  })
  splashWindow.setIgnoreMouseEvents(true)
  splashWindow.loadURL(
    isDev
      ? "http://localhost:3001/splash.html"
      : `file://${path.join(__dirname, "../build/splash.html")}`
  );
  splashWindow.webContents.on('did-finish-load', function () {
    if(splashWindow) splashWindow.show();
  });
}

function loadCrusheePage() {
  //mainWindow.loadURL('http://127.0.0.1:1603/', { "extraHeaders": "pragma: no-cache\n" })
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3001/index.html"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 700,
    icon: __dirname + '/assets/icon-shadow.ico',
    title: 'Crushee',
    show: false,
    webPreferences: {
      navigateOnDragDrop: false,
      webSecurity: false,
      scrollBounce: true,
      //experimentalFeatures: true,
      preload: path.resolve(__dirname, 'preload.js')
    },
    titleBarStyle: "default"
  })

  mainWindow.webContents.on('did-finish-load', function () {
    splashWindow.hide();
    mainWindow.show();

    mainWindow.webContents.send('version', `v${crusheeVersion}`)

  });

  // and load the index.html of the app.

  setTimeout(loadCrusheePage, 600)

  mainWindow.setMenuBarVisibility(false)
  mainWindow.setMenuBarVisibility(true)
  const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
    server.kill()
    app.quit()
  })
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', tryStart)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    server.kill()
    app.quit()
  }
  server.kill()
  app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    try {
      tryStart()
    } catch (e) {
      // Not sure what to do. It didn't work.
      server.kill()
      app.quit()
    }
  }
})


let server = fork("./src/optimizer/index.js")

// Start up app
function tryStart() {
  createSplash()
  createWindow()
  tryingConnection = false
}


const menuTemplate = [
  {
      label: 'File',
      submenu: [
        {
          label: 'Add File(s)',
          accelerator: 'Shift+CmdOrCtrl+A',
          click: () => {
            mainWindow.webContents.send('shortcut', {
              shortcut: "add-files"
            })
          }
      },{
        label: 'Save All Files',
        accelerator: 'CmdOrCtrl+S',
        click: () => {
            console.log('Save All Clicked');
          mainWindow.webContents.send('shortcut', {
            shortcut: "save-all"
          })
        }
    }, {
              type: 'separator'
          }, {
              label: 'Quit',
              click: () => {
                  server.kill(); app.quit();
              }
          }
      ]
  },
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Recrush All Files',
        accelerator: 'CmdOrCtrl+R',
        click: () => {
          mainWindow.webContents.send('shortcut', {
            shortcut: "recrush"
          })
        }
    },
    {
      label: 'Clear All Files',
      accelerator: 'CmdOrCtrl+D',
      click: () => {
        mainWindow.webContents.send('shortcut', {
          shortcut: "clear-all"
        })
      }
      }, {
        type: 'separator'
      }, {
        label: 'Remove Unoptimized Files (<0%)',
        accelerator: 'CmdOrCtrl+L',
        click: () => {
          console.log('Remove Larger Clicked');
          mainWindow.webContents.send('shortcut', {
            shortcut: "remove-large-files"
          })
        }
      }
    ]
},
{
  label: 'Help',
  submenu: [
      /*{
          label: 'About Crushee',
          click: () => {
              console.log('About Clicked');
          }
      },*/
    {
      label: 'Open Inspector Window',
      accelerator: 'CmdOrCtrl+I',
      click: () => {
        console.log('Inspector Clicked');
        mainWindow.webContents.openDevTools()
        mainWindow.webContents.send('shortcut', {
          shortcut: "inspector"
        })
      }
    },
      {
        label: 'Reset App',
        click: () => {
            console.log('Reset Clicked');
          mainWindow.webContents.send('shortcut', {
            shortcut: "reset-app"
          })
        }
    },
      /*{
          label: 'Check For Updates',
          click: () => {
              app.quit();
          }
      },*/
    {
      label: `Crushee v${crusheeVersion}`,
      click: () => {
        console.log('Version Clicked');
        require("electron").shell.openExternal("https://crushee.app/?app")
      }
    }
  ]
}
];

// Kill everything if this process fails
app.on("error", () => { app.quit() })
