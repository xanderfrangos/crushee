const { app, BrowserWindow, ipcMain, Menu, nativeTheme, dialog, shell } = require('electron')
const path = require("path")
const fs = require("fs")
const isDev = require("electron-is-dev");
const os = require("os")
const { v4: uuid } = require('uuid');
let mainWindow
let splashWindow
let settingsWindow
const debug = console
let analytics = false
let analyticsQueue = false
let analyticsInterval = false

// App version
const crusheeVersion = require('../package.json').version

// Handle multiple instances
const appLocked = app.requestSingleInstanceLock()

if (!appLocked) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    console.log(commandLine, workingDirectory)
    if(commandLine.length <= 1) return false;
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
      tryOpenFiles(commandLine.slice(1))
    }
  })
}

// Handle opening files
app.on('will-finish-launching', () => {
  app.on('open-file', (event, path) => {
    event.preventDefault()
    tryOpenFiles(path)
  });
});

function tryOpenFiles(files) {
  try {
    if(files) {
      if(typeof files == "object") {
        for(let file of files) {
          if(file.indexOf("--") === 0) continue;
          try {
            console.log(file)
            fs.lstat(file, (err, stats) => {
              if(!err) {
                mainWindow.webContents.send("open-file", file)
              }
            })
          } catch(e) { }
        }
      } else if(typeof files == "string") {
        try {
          fs.lstat(files, (err, stats) => {
            if(!err) {
              mainWindow.webContents.send("open-file", files)
            }
          })
        } catch(e) { }
      }
    }
  } catch(e) {
    console.log('tryOpenFiles failed', e)
  }
}

const settingsPath = path.join(app.getPath("userData"), `\\settings${(isDev ? "-dev" : "")}.json`)
let settings = {
  theme: 'system',
  threads: 'auto',
  updates: true,
  analytics: true,
  backgroundColor: "#FFFFFF",
  autoThreads: (os.cpus().length > 3 ? Math.floor(os.cpus().length / 3) + 1 : 1),
  uuid: uuid(),
  version: 'v' + app.getVersion(),
  isAppX: (app.name == "crushee-appx" ? true : false)
}

function readSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      settings = Object.assign(settings, JSON.parse(fs.readFileSync(settingsPath)))
    } else {
      fs.writeFileSync(settingsPath, JSON.stringify({}))
    }
  } catch (e) {
    debug.error("Couldn't load settings", e)
  }
  processSettings()
}

function writeSettings(newSettings = {}, processAfter = true) {
  settings = Object.assign(settings, newSettings)

  // Save new settings
  try {
    fs.writeFile(settingsPath, JSON.stringify(settings), (e) => { if (e) debug.error(e) })
  } catch (e) {
    debug.error("Couldn't save settings.", settingsPath, e)
  }
  if (processAfter) processSettings();
}

ipcMain.on('send-settings', (event, settings) => {
  writeSettings(settings)
})

ipcMain.on('request-settings', () => {
  debug.log("Settings requested")
  processSettings()
})

function processSettings() {
  if (settings.theme) {
    nativeTheme.themeSource = settings.theme
    if(mainWindow) mainWindow.setVibrancy(getVibrancy())
  }
  if(settings.analytics) {
    if(!analytics) {
      console.log("\x1b[34mAnalytics:\x1b[0m starting with UUID " + settings.uuid)
      analytics = require('ga4-mp').createClient("o4Sxc3-yQ-eLdlapMngsnQ", "G-CB0578PNH1", settings.uuid)

      analytics.send([{
        name: "page_view",
        params: {
          page_location: app.name + "/" + "v" + app.getVersion(),
          page_title: app.name + "/" + "v" + app.getVersion(),
          page_referrer: app.name,
          os_version: os.release(),
          os_platform: os.platform(),
          app_type: app.name,
          app_version: app.getVersion(),
          cpu_cores: os.cpus().length,
          cpu_name: os.cpus()[0].model,
          engagement_time_msec: 1
        }
      }], true)
      analyticsQueue = true

      analyticsInterval = setInterval(() => {
        if(analytics && analyticsQueue) {
          console.log("\x1b[34mAnalytics:\x1b[0m Sending analytics")
          analytics.flushBuffer()
          analyticsQueue = false
        }
      }, 30 * 1000)
    }
  } else {
    analytics = false
    if(analyticsInterval) {
      clearInterval(analyticsInterval)
    }
  }
  settings.version = 'v' + app.getVersion()
  settings.isAppX = (app.name == "crushee-appx" ? true : false)
  sendToAllWindows('settings-updated', settings)
}

function sendToAllWindows(eventName, data) {
  if (mainWindow) {
    mainWindow.webContents.send(eventName, data)
  }
  if (settingsWindow) {
    settingsWindow.webContents.send(eventName, data)
  }
}

function getVibrancy() {
  if(os.platform() === "darwin") {
    const release = os.release().split('.')[0]
    if(release >= 18) {
      return 'fullscreen-ui'
    }
  }
  return (nativeTheme.shouldUseDarkColors ? "dark" : "light")
}

function createSplash() {
  splashWindow = new BrowserWindow({
    width: 320,
    height: 320,
    icon: __dirname + '/assets/icon-shadow.ico',
    title: 'Crushee',
    show: false,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    webPreferences: {
      navigateOnDragDrop: false,
      contextIsolation: false
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
    setTimeout(() => {
      if (splashWindow) splashWindow.show();
    }, 50)
  });
}

function createSettingsWindow() {
  if (settingsWindow != null) {
    settingsWindow.focus()
    return false;
  }
  settingsWindow = new BrowserWindow({
    width: 400,
    height: 640,
    icon: __dirname + '/assets/icon-shadow.ico',
    title: 'Crushee Settings',
    show: false,
    frame: (os.platform() === "darwin" ? true : false),
    resizable: false,
    backgroundColor: '#00FFFFFF',
    titleBarStyle: 'hidden',
    vibrancy: getVibrancy(),
    webPreferences: {
      navigateOnDragDrop: false,
      webSecurity: false,
      scrollBounce: true,
      preload: path.resolve(__dirname, 'settings.preload.js'),
      contextIsolation: false
    }
  })
  settingsWindow.loadURL(
    isDev
      ? "http://localhost:3001/settings.html"
      : `file://${path.join(__dirname, "../build/settings.html")}`
  );

  settingsWindow.webContents.on('did-finish-load', () => {
    settingsWindow.show()
    //settingsWindow.webContents.openDevTools()
  })

  settingsWindow.on('closed', function () {
    settingsWindow = null
  })

}

function createWindow() {

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1070,
    height: 720,
    minWidth: 700,
    minHeight: 600,
    icon: __dirname + '/assets/icon-shadow.ico',
    title: 'Crushee',
    show: false,
    frame: (os.platform() === "darwin" ? true : false),
    backgroundColor: '#00FFFFFF',
    titleBarStyle: 'hidden',
    vibrancy: getVibrancy(),
    webPreferences: {
      navigateOnDragDrop: false,
      webSecurity: false,
      scrollBounce: true,
      preload: path.resolve(__dirname, 'app.preload.js'),
      contextIsolation: false
    }
  })
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3001/index.html"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  mainWindow.webContents.on('did-finish-load', function () {
    processSettings()

    setTimeout(() => {
      mainWindow.show();
    }, 250)
    
    tryOpenFiles(isDev ? process.argv.slice(2) : process.argv.slice(1))

    mainWindow.webContents.send('version', `v${crusheeVersion}`)
  });

  // and load the index.html of the app.


  mainWindow.setMenuBarVisibility(false)
  mainWindow.setMenuBarVisibility(true)
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    app.quit()
  })
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', tryStart)

// Quit when all windows are closed.
app.on('before-quit', function () {
  try {
    if(mainWindow) mainWindow.webContents.send('quit-app')
  } catch(e) { }
  app.exit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    try {
      tryStart()
    } catch (e) {
      // Not sure what to do. It didn't work.
      app.quit()
    }
  }
})







// Start up app
function tryStart() {
  readSettings()
  createWindow()
  tryingConnection = false
}

const menus = {


  File: [
    {
      label: 'Add file(s)',
      accelerator: 'Shift+CmdOrCtrl+A',
      click: () => {
        mainWindow.webContents.send('shortcut', {
          shortcut: "add-files"
        })
      }
    }, {
      label: 'Add folder(s)',
      click: () => {
        mainWindow.webContents.send('shortcut', {
          shortcut: "add-folders"
        })
      }
    }, {
      type: 'separator'
    }, {
      label: 'Save all files',
      accelerator: 'CmdOrCtrl+S',
      click: () => {
        console.log('Save All Clicked');
        mainWindow.webContents.send('shortcut', {
          shortcut: "save-all"
        })
      }
    }, {
      label: 'Save to folder',
      accelerator: 'CmdOrCtrl+F',
      click: () => {
        console.log('Save To Folder Clicked');
        mainWindow.webContents.send('shortcut', {
          shortcut: "save-to-folder"
        })
      }
    }, {
      type: 'separator'
    }, {
      label: 'Preferences',
      click: () => {
        createSettingsWindow()
      }
    }, {
      type: 'separator'
    }, {
      label: 'Quit',
      accelerator: 'CmdOrCtrl+Q',
      click: () => {
        app.quit();
      }
    }
  ],


  Edit: [
    {
      label: 'Recrush all files',
      accelerator: 'CmdOrCtrl+R',
      click: () => {
        mainWindow.webContents.send('shortcut', {
          shortcut: "recrush"
        })
      }
    },
    {
      label: 'Clear all files',
      accelerator: 'CmdOrCtrl+D',
      click: () => {
        mainWindow.webContents.send('shortcut', {
          shortcut: "clear-all"
        })
      }
    }, {
      type: 'separator'
    }, {
      label: 'Remove unoptimized files (<0%)',
      accelerator: 'CmdOrCtrl+L',
      click: () => {
        console.log('Remove Larger Clicked');
        mainWindow.webContents.send('shortcut', {
          shortcut: "remove-large-files"
        })
      }
    }
  ],


  Help: [
    {
      label: 'Developer tools',
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
      type: 'separator'
    },
    {
      label: `About Crushee v${crusheeVersion}`,
      click: () => {
        console.log('Version Clicked');
        require("electron").shell.openExternal("https://crushee.app/?app")
      }
    }
  ],

  RightClickFile: [
    {
      label: `Crush file`,
      click: () => {
        mainWindow.webContents.send('shortcut', {
          shortcut: "right-click-crush"
        })
      }
    }, {
      label: `Compare changes`,
      click: () => {
        mainWindow.webContents.send('shortcut', {
          shortcut: "right-click-compare"
        })
      }
    }, {
      label: `Show original`,
      click: () => {
        mainWindow.webContents.send('shortcut', {
          shortcut: "right-click-show-original"
        })
      }
    }, {
      type: 'separator'
    }, {
      label: `Save`,
      click: () => {
        mainWindow.webContents.send('shortcut', {
          shortcut: "right-click-save"
        })
      }
    },
    {
      label: `Save as...`,
      click: () => {
        mainWindow.webContents.send('shortcut', {
          shortcut: "right-click-save-as"
        })
      }
    },
    {
      type: 'separator'
    },
    {
      label: `Remove`,
      click: () => {
        mainWindow.webContents.send('shortcut', {
          shortcut: "right-click-remove"
        })
      }
    }
  ]

}


const menuTemplate = [
  {
    label: 'File',
    submenu: menus.File
  },
  {
    label: 'Edit',
    submenu: menus.Edit
  },
  {
    label: 'Help',
    submenu: menus.Help
  }
];


ipcMain.on('popupMenu', (event, args) => {

  const popupMenu = menus[args.menu]

  if (args.disable) {
    switch (args.menu) {
      case "RightClickFile":
        popupMenu[1].enabled = false
        popupMenu[4].enabled = false
        popupMenu[5].enabled = false
        break;
      case "File":
        popupMenu[3].enabled = false
        popupMenu[4].enabled = false
        break;
      case "Edit":
        break;
    }
  } else {
    switch (args.menu) {
      case "RightClickFile":
        popupMenu[1].enabled = true
        popupMenu[4].enabled = true
        popupMenu[5].enabled = true
        break;
      case "File":
        popupMenu[3].enabled = true
        popupMenu[4].enabled = true
        break;
      case "Edit":
        break;
    }
  }

  const menu2 = Menu.buildFromTemplate(popupMenu);
  menu2.popup({
    x: (args.x ? Math.round(args.x) : null),
    y: (args.y ? Math.round(args.y) : null)
  })
})


ipcMain.on('crushEvent', (event, settings) => {
  if(analytics) {
    /*
    analyticsQueue = true
    for(let category in settings) {
      for(let key in settings[category]) {
        analytics.send([{
          name: "crushee_crush_settings",
          params: {
            category: category,
            key: key,
            value: settings[category][key],
            engagement_time_msec: 1
          }
        }], true)
      }
    }
    */
  }
})
ipcMain.on('saveEvent', (event, data) => {
  if(analytics) {
    analyticsQueue = true
    for(let category in data) {
      for(let key in data[category]) {
        analytics.send([{
          name: "crushee_results",
          params: {
            category: category,
            key: key,
            value: data[category][key],
            engagement_time_msec: 1
          }
        }], true)
      }
    }
  }
})

ipcMain.on('open-url', (event, url) => {
  require("electron").shell.openExternal(url)
})

// Fix http:// + file:// mixing
const { protocol } = require("electron");

ipcMain.handle('showOpenDialog', async (event, params) => {
  return dialog.showOpenDialog(params)
})

ipcMain.handle('showSaveDialog', async (event, params) => {
  return dialog.showSaveDialog(params)
})

ipcMain.on('setProgressBar', (event, progress) => {
  try {
    mainWindow.setProgressBar(progress)
  } catch(e) {}
  
})

ipcMain.on('setWindowState', (event, state) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  switch(state) {
    case "maximize": win.maximize(); break;
    case "unmaximize": win.unmaximize(); break;
    case "minimize": win.minimize(); break;
    case "close": win.close(); break;
  }
})

ipcMain.handle('isMaximized', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  return win.isMaximized()
})

ipcMain.on('showItemInFolder', (e, filePath) => {
  shell.showItemInFolder(filePath)
})

app.whenReady().then(() => {
  protocol.registerFileProtocol('file', (request, callback) => {
    const pathname = decodeURI(request.url.replace('file:///', ''));
    const parts = pathname.split('?')
    callback(parts[0]);
  });
});

// Kill everything if this process fails
app.on("error", () => { app.exit() })