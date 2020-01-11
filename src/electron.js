const { app, BrowserWindow, ipcMain, systemPreferences, Menu, MenuItem, Notification, nativeTheme } = require('electron')
const path = require("path")
const fs = require("fs")
const { fork } = require("child_process")
const isDev = require("electron-is-dev");
const os = require("os")
const ua = require('universal-analytics');
const uuid = require('uuid/v4')
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
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
      tryOpenFiles(files)
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
  if(files) {
    if(typeof files == "object") {
      for(let file in files) {
        fs.lstat(file, (err, stats) => {
          if(!err) {
            mainWindow.webContents.send("open-file", file)
          }
        })
      }
    } else if(typeof files == "string") {
      fs.lstat(files, (err, stats) => {
        if(!err) {
          mainWindow.webContents.send("open-file", files)
        }
      })
    }
  }
}



const settingsPath = path.join(app.getPath("userData"), `\\settings${(isDev ? "-dev" : "")}.json`)
let settings = {
  theme: 'system',
  threads: 'auto',
  updates: true,
  analytics: true,
  autoThreads: (os.cpus().length > 3 ? Math.floor(os.cpus().length / 3) + 1 : 1),
  uuid: uuid()
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
  }
  if(settings.analytics) {
    if(!analytics) {
      console.log("\x1b[34mAnalytics:\x1b[0m starting with UUID " + settings.uuid)
      analytics = ua('UA-137776048-2', settings.uuid)
      analytics.set("ds", "app")
      analytics.pageview(app.name + "/" + "v" + app.getVersion() + "/" + os.platform()).send()
      analytics.event({
        ec: "Session Information",
        ea: "Version",
        el: "v" + app.getVersion()
      }).event({
        ec: "Session Information",
        ea: "App Name",
        el: app.name
      }).event({
        ec: "Session Information",
        ea: "Platform",
        el: os.platform()
      }).event({
        ec: "Session Information",
        ea: "OS Version",
        el: os.release()
      }).event({
        ec: "Session Information",
        ea: "CPU Cores",
        el: os.cpus().length
      }).event({
        ec: "Session Information",
        ea: "CPU Model",
        el: os.cpus()[0].model
      }).send()

      analyticsInterval = setInterval(() => {
        if(analytics && analyticsQueue) {
          console.log("\x1b[34mAnalytics:\x1b[0m Sending analytics")
          analyticsQueue.send()
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
    if (splashWindow) splashWindow.show();
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
    frame: false,
    resizable: false,
    backgroundColor: '#00FFFFFF',
    titleBarStyle: 'hidden',
    vibrancy: 'fullscreen-ui',
    webPreferences: {
      navigateOnDragDrop: false,
      webSecurity: false,
      scrollBounce: true,
      preload: path.resolve(__dirname, 'settings.preload.js')
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
    frame: false,
    backgroundColor: '#00FFFFFF',
    titleBarStyle: 'hidden',
    vibrancy: 'fullscreen-ui',
    webPreferences: {
      navigateOnDragDrop: false,
      webSecurity: false,
      scrollBounce: true,
      //experimentalFeatures: true,
      preload: path.resolve(__dirname, 'app.preload.js')
    }
  })
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3001/index.html"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  mainWindow.webContents.on('did-finish-load', function () {
    processSettings()

    let blurEnabled = true
    try {
      if (os.platform() === "win32") {
        // Disabling blur on Windows for the foreseeable future. Too buggy. 
        blurEnabled = false
        /*
        const SWCA = require('windows-swca')
        const release = os.release().split('.')[2]
        if (release < 18363) {
          blurEnabled = false
        } else if (release < 19041) {
          SWCA.SetWindowCompositionAttribute(mainWindow.getNativeWindowHandle(), SWCA.ACCENT_STATE.ACCENT_ENABLE_BLURBEHIND, 0xDDDDDDBB)
        } else {
          SWCA.SetWindowCompositionAttribute(mainWindow.getNativeWindowHandle(), SWCA.ACCENT_STATE.ACCENT_ENABLE_BLURBEHIND, 0xDDDDDDBB)

          // Maybe one day this will work without lagging when transparency is on in Windows...
          //SWCA.SetWindowCompositionAttribute(mainWindow.getNativeWindowHandle(), SWCA.ACCENT_STATE.ACCENT_ENABLE_ACRYLICBLURBEHIND, 0xDDDDDD22)
        }
        */
      }
    } catch (e) {
      console.log("Could not enable blur.", e)
      blurEnabled = false
    }


    setTimeout(() => {
      if (splashWindow) {
        splashWindow.close();
        splashWindow = null;
      }
      mainWindow.webContents.send('blurEnabled', blurEnabled)
      mainWindow.show();
    }, 500)

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
    mainWindow = null
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
    app.quit()
  }
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
      app.quit()
    }
  }
})







// Start up app
function tryStart() {
  createSplash()
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
    if(!analyticsQueue) {
      analyticsQueue = analytics
    }
    for(let category in settings) {
      for(let key in settings[category]) {
        analyticsQueue.event({
          ec: "Crush Settings",
          ea: category,
          el: key,
          ev: settings[category][key]
        })
      }
    }
  }
})
ipcMain.on('saveEvent', (event, data) => {
  if(analytics) {
    if(!analyticsQueue) {
      analyticsQueue = analytics
    }
    for(let category in data) {
      for(let key in data[category]) {
        analyticsQueue.event({
          ec: "Save Results",
          ea: category,
          el: key,
          ev: data[category][key]
        })
      }
    }
  }
})
ipcMain.on('event', (event, data) => {
  if(analytics) {
    if(!analyticsQueue) {
      analyticsQueue = analytics
    }
    analyticsQueue.event(data)
  }
})

// Kill everything if this process fails
app.on("error", () => { app.quit() })