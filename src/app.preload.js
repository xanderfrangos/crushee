const { ipcRenderer: ipc, remote, Menu, MenuItem, BrowserWindow, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const { fork } = require("child_process")
const uuidv1 = require('uuid/v1');
const { dialog } = require('electron').remote
const slash = require('slash')
let browser = remote.getCurrentWindow()


console.log("Starting optimizer...")
let server = fork(path.join(__dirname, "../src/optimizer/server.js"))

remote.app.on("will-quit", () => {
    server.send(JSON.stringify({ type: "quit" }))
})

function openDialog(isFolder = false) {

    const params = {
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
    }

    if(isFolder == true) {
        params.properties.push('openDirectory')
    }

    dialog.showOpenDialog(params).then((returned) => {
        const files = returned.filePaths
        if (files == undefined)
            return false;

        console.log(files)
        window.addFiles(files)
    })
}

function saveDialog(isFolder = false) {
    if(isFolder) {
        dialog.showOpenDialog({
        title: "Select folder",
        buttonLabel: 'Select folder',
        properties: [
            'openDirectory'
        ]
        }).then((returned) => {
            const files = returned.filePaths
            if (files == undefined)
                return false;

            console.log(files)
            if(files.length === 1) {
                window.saveAllFiles(files[0])
            } else {
                console.log("Length not 1")
                return false;
            }
        })
    }
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

ipcRenderer.on('shortcut', function (event, data) {
    console.log(data)

    switch (data.shortcut) {
        case "recrush":
            window.recrushAll();
            break;
        case "add-files":
            openDialog(false);
            break;
        case "add-folders":
            openDialog(true);
            break;
        case "clear-all":
            window.clearAllFiles()
            break;
        case "save-all":
            //window.$(".action--download-all").click()
            window.saveAllFiles()
            break;
        case "save-to-folder":
            saveDialog(true);
            break;
        case "reset-app":
            window.setStatusBar("Resetting app preferences", "working")
            window.localStorage.clear()
            window.localStorage.setItem("appReset", "true")
            window.location.reload()
            break;
        case "remove-large-files":
            window.files.forEach(file => {
                if (file.status == "done" && file.endSize > file.startSize) {
                    window.deleteUUID(file.uuid)
                }
            });
            break;
        case "right-click-save":
            window.saveFiles(window.rightClickTarget)
            break;
        case "right-click-crush":
            window.crushFile(window.rightClickTarget, window.GlobalSettings.Quality)
            break;
        case "right-click-remove":
            window.deleteUUID(window.rightClickTarget, true)
            break;
    }

});


// Current version number recieved
ipcRenderer.on('version', (event, curVersion) => {

})


window.popupMenu = (menu, x = null, y = null, disable = false) => {
    ipcRenderer.send("popupMenu", {
        menu,
        x,
        y,
        disable
    })
}


const saveFile = async (filePath, destination, filename, cb) => {
    console.log(filePath, destination, filename, cb)
};





function addFiles(files) {

    window.sendMessage("upload", {
        path: files
    })
}
window.addFiles = addFiles


const sendMessage = (type, payload = {}) => {
    window.server.send(JSON.stringify({
        type,
        payload
    }))
}
window.sendMessage = sendMessage



server.on('message', processMessage)



window.server = server
window.thisWindow = browser
window.openDialog = openDialog
window.saveFile = saveFile










window.fileCounts = {
    total: 0,
    error: 0,
    ready: 0,
    crushing: 0,
    saving: 0,
}

window.recrushAll = () => {
    for (let file in window.files) {
        window.crushFile(file)
    }
}

window.crushFile = (UUID, options = defaultSettings) => {
    const file = files[UUID]
    if (file.Status === "done" || file.Status === "analyzed") {
        file.Status = "crushing"
        sendMessage("crush", { UUID, options: JSON.stringify(options) })
        window.fileCounts.crushing++
    }
}

window.clearAllFiles = function () {
    for (let file in window.files) {
        window.deleteUUID(file, false)
    }
    sendUpdate()
}

window.deleteUUID = (UUID, sendUpdate = true) => {
    const file = files[UUID]
    if (file.Status === "done" || file.Status === "analyzed" || file.Status === "error") {
        file.Status = "deleted"
        sendMessage("delete", UUID)
        window.fileCounts.total--
    }
    delete files[UUID]
    if(sendUpdate) {
        window.sendUpdate()
    }
}

window.saveFiles = (files, directory = false, filename = false) => {
    window.sendMessage("save-files", {
        files,
        directory,
        filename
    })
}

window.saveAllFiles = (folder = false) => {
    const fileList = []
    for (let UUID in window.files) {
        const file = window.files[UUID]
        if(file.Status == "done") {
            fileList.push(UUID)
        }
    }
    window.saveFiles(fileList, folder)
}











const defaultSettings = {
    resize: {
        width: "",
        height: "",
        crop: false
    },
    jpg: {
        quality: 95,
        make: false,
        subsampling: 1,
        useOriginal: false
    },
    png: {
        qualityMin: 50,
        qualityMax: 95
    },
    gif: {
        colors: 128
    },
    webp: {
        quality: 90,
        make: false,
        only: false
    },
    app: {
        qualityPreset: 4,
        advancedQuality: "false",
        overwite: false,
        darkMode: false,
        convert: "none"
    }
}
window.defaultSettings = defaultSettings



const qualityPresets = [
    // Low
    {
        jpg: {
            quality: 77,
            subsampling: 3,
            useOriginal: false
        },
        png: {
            qualityMin: 1,
            qualityMax: 75
        },
        webp: {
            quality: 70
        }
    },
    // Medium
    {
        jpg: {
            quality: 85,
            subsampling: 2,
            useOriginal: false
        },
        png: {
            qualityMin: 10,
            qualityMax: 85
        },
        webp: {
            quality: 88
        }
    },
    // High
    {
        jpg: {
            quality: 94,
            subsampling: 2,
            useOriginal: false
        },
        png: {
            qualityMin: 15,
            qualityMax: 95
        },
        webp: {
            quality: 92
        }
    },
    // Lossless-ish
    {
        jpg: {
            quality: 95,
            subsampling: 1,
            useOriginal: false
        },
        png: {
            qualityMin: 25,
            qualityMax: 98
        },
        webp: {
            quality: 95
        }
    },
]
window.qualityPresets = qualityPresets








function processMessage(ev) {
    console.log(ev)
    var data = ev
    //console.log(data)
    if (typeof data.type != "undefined")
        switch (data.type) {
            case "check":
                checkUUIDs(data.payload);
                break;
            case "update":
                if (window.files[data.payload.file.UUID]) {
                    if(data.payload.file.Status !== "deleted") {
                        window.files[data.payload.file.UUID] = data.payload.file
                    }
                    if (window.GlobalSettings.RemoveErroredFiles && data.payload.file.Status === "error") {
                        deleteUUID(data.payload.file.UUID)
                    }
                }
                sendUpdate()
                break;
            case "upload":
                window.files[data.payload.file.UUID] = data.payload.file
                window.fileCounts.total++
                sendUpdate()
                break;
            case "replace":
                var id = files.getFileID(data.payload.oldUUID)
                for (var key in data.payload.file) {
                    files.list[id][key] = data.payload.file[key]
                }
                files.list[id].setStatus(data.payload.file.status)
                sendUpdate()
                break;

        }
}


const sendUpdate = () => {
    window.dispatchEvent(new CustomEvent('filesUpdated', {
        detail: {
          ts: Date.now()
        }
      }))
}
window.sendUpdate = sendUpdate


window.getFile = (uuid) => {
    for (file of files) {
        if (file === uuid) {
            return files[file]
        }
    }
}




window.GlobalSettings = {
    FilterUsingExtension: true,
    RemoveErroredFiles: true,
    NumberOfThreads: 2,
    Quality: Object.assign({}, defaultSettings)
}

window.sendMessage("settings", {
    settings: window.GlobalSettings
})