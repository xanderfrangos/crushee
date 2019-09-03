const { ipcRenderer: ipc, remote, Menu, MenuItem, BrowserWindow, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const { fork } = require("child_process")
const uuidv1 = require('uuid/v1');
const { dialog } = require('electron').remote
const slash = require('slash')
let browser = remote.getCurrentWindow()


console.log("Starting optimizer...")
let server = fork("./src/optimizer/index.js")

remote.app.on("will-quit", () => {
    server.send(JSON.stringify({ type: "quit" }))
})

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

const saveFile = async (filePath, destination, filename, cb) => {
    
    let dest = destination
    let outPath
    if(destination == false) {
        dest = await dialog.showSaveDialog({
            title: "Save crushed image",
            defaultPath: filename
        })
        outPath = dest
    } else {
        outPath = slash(path.resolve(path.dirname(dest), filename));
    }

    const fixedPath = slash(filePath.replace("file://", ""));
    let success = false

    console.log(fixedPath, outPath)
    try {
        fs.copyFileSync(fixedPath, outPath)
        success = true
    } catch(e) {
        console.error(e)
    }
    cb({
        status: "error",
        filename,
        path: outPath,
        success
    })
};


window.electron = {
    download: saveFile,
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
window.thisWindow = browser