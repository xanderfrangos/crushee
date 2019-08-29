const { ipcRenderer: ipc, remote, Menu, MenuItem, BrowserWindow, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const request = require('request');
const uuidv1 = require('uuid/v1');

const { dialog } = require('electron').remote


console.log("preload.js running...")


const { fork } = require("child_process")
let server = fork("./src/optimizer/index.js")

function openDialog() {
    dialog.showOpenDialog({
        title: "Select image(s)",
        filters: [
            { name: 'Images', extensions: ['jpg', 'png', 'gif', 'svg'] },
            { name: 'All Files', extensions: ['*'] }
        ],
        buttonLabel: '+ Add File(s)',
        properties: [
            'openFile',
            'multiSelections'
        ]
    },
        (files) => {
            if(files == undefined)
                return false;

            console.log(files)
            window.addFiles(files)
        })
}

// Temporary downloads folder
let tmpFolder = path.resolve(remote.app.getPath("userData"), "dl-tmp")
if (!fs.existsSync(tmpFolder)) {
    fs.mkdirSync(tmpFolder)
}

const downloadFile = (filePath, dest, filename, cb) => {
    console.log(filePath, dest, filename)

    let outPath = path.resolve(path.dirname(dest), filename);

    let uuid = uuidv1()
    let tmpFile = tmpFolder + uuid + ".dat"
    while (fs.existsSync(tmpFile)) {
        uuid = uuidv1()
        tmpFile = tmpFolder + uuid + ".dat"
    }

    const fixedPath = filePath.replace("file://", "");
    let success = false
    fs.copyFileSync(fixedPath, outPath)

    if(fs.existsSync(outPath))

    if (fs.existsSync(outPath)) {
        success = true
        fs.unlinkSync(fixedPath)
    }

    cb({
        status: "done",
        filename,
        path: outPath,
        success
    })
};


window.electron = {
    download: downloadFile,
    setDockBadge,
}

ipc.on('markAllComplete', () => {
    // the todo app defines this function
    window.electron.markAllComplete();
});


function setDockBadge(count) {
    if (process.platform === 'darwin') {
        //Coerce count into a string. Passing an empty string makes the badge disappear.
        remote.app.dock.setBadge('' + (count || ''));
    }
}

  ipcRenderer.on('shortcut' , function(event , data){ 
      
    switch(data.shortcut) {
        case "recrush":
            window.recrushAll();
            break;
        case "add-files":
            //window.openFilePicker();
            openDialog();
            break;
        case "clear-all":
            window.clearAllFiles()
            break;
        case "save-all":
            window.$(".action--download-all").click()
            break;
        case "reset-app":
            window.setStatusBar("Resetting app preferences", "working")
            window.localStorage.clear()
            window.localStorage.setItem("appReset", "true")
            window.location.reload()
            break;
        case "remove-large-files":
            window.files.list.forEach(file => {
                if(file.status == "done" && file.endSize > file.startSize) {
                    window.deleteUUID(file.uuid)
                }
            });
            break;
    }

});


// Current version number recieved
ipcRenderer.on('version', (event, curVersion) => {

    // Get version number from server
    fetch(`https://crushee.app/version.txt?${Date.now()}`).then((response) => {
        response.text().then((version) => {
            
            // Make sure valid response and check if version numbers are different
            if(version.substring(0, 1) == 'v' && version != curVersion) {

                // Display "New version" message
                window.$(".elem--status-bar--right .new-version").click(() => {
                    require("electron").shell.openExternal("https://crushee.app/?app")
                })
                window.$(".elem--status-bar--right .new-version").show()
                
            }

        })
        
    }).catch(() => {
        // No connection, we don't care
    })
})

window.server = server