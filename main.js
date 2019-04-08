const { app, BrowserWindow, ipcMain, systemPreferences, Menu, MenuItem, Notification } = require('electron')
const path = require("path")
const fs = require("fs")
const { net } = require('electron')
const { fork, spawn } = require("child_process")
let mainWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 700,
    icon: __dirname + '/assets/icon-shadow.ico', 
    title: 'Crushee',
    webPreferences: {
      navigateOnDragDrop: false,
      webSecurity: false,
      scrollBounce: true,
      experimentalFeatures: true,
      preload: path.resolve(__dirname, 'preload.js')
    },
    titleBarStyle: "default"
  })


  // and load the index.html of the app.
  
  setTimeout(() => {
    mainWindow.loadURL('http://localhost:1603/', {"extraHeaders" : "pragma: no-cache\n"})
    mainWindow.webContents.openDevTools()
  }, 400)

  //mainWindow.setMenuBarVisibility(false)
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
    } catch(e) {
      // Not sure what to do. It didn't work.
    }
  }
})


let crusheeDir = path.resolve(__dirname, 'crushee-server')
if(!fs.existsSync(crusheeDir)) {
  crusheeDir = path.resolve(__dirname, '../crushee-server')
}
let server
if (process.platform === 'darwin') {
  server = spawn(path.resolve(crusheeDir + "\/node"), ["index.js"], {cwd: crusheeDir, stdio: ['inherit', 'inherit', 'inherit', 'ipc'], silent: false})
} else {
  server = spawn(path.resolve(crusheeDir + "\\node.exe"), ["index.js"], {cwd: crusheeDir, stdio: ['inherit', 'inherit', 'inherit', 'ipc'], silent: false})
}

// Make sure Express server is available before loading window
let tryingConnection = false
function tryStart() {
  const connect = setInterval(() => {
    if(!tryingConnection) {
      tryingConnection = true
      try {
        let request = net.request('http://localhost:1603/health')
        request.on('response', (response) => {
          response.on('data', (data) => {
            if(data == "OK") {
              createWindow()
              clearInterval(connect)
            }
            tryingConnection = false 
          })
        })
        request.end()
      } catch(e) {
        tryingConnection = false
      }
      
    }
  }, 100)
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
              console.log('About Clicked');
          }
      },{
        label: 'Save All Files',
        accelerator: 'CmdOrCtrl+S',
        click: () => {
            console.log('About Clicked');
        }
    }, {
              type: 'separator'
          }, {
              label: 'Quit',
              click: () => {
                  app.quit();
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
            console.log('About Clicked');
        }
    },
    {
      label: 'Clear All Files',
      accelerator: 'CmdOrCtrl+C',
      click: () => {
          console.log('About Clicked');
      }
  }
    ]
},
{
  label: 'Help',
  submenu: [
      {
          label: 'About Crushee',
          click: () => {
              console.log('About Clicked');
          }
      },
      {
        label: 'Reset App',
        click: () => {
            console.log('About Clicked');
        }
    },
      {
          label: 'Check For Updates',
          click: () => {
              app.quit();
          }
      }
  ]
}
];