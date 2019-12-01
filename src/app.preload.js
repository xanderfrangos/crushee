const { ipcRenderer: ipc, remote, Menu, MenuItem, BrowserWindow, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const { fork } = require("child_process")
const uuidv1 = require('uuid/v1');
const { dialog } = require('electron').remote
const slash = require('slash')
let browser = remote.getCurrentWindow()


console.log("Starting optimizer...")
let server = fork("./src/optimizer/server.js")

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
            if (files == undefined)
                return false;

            console.log(files)
            window.addFiles(files)
        })
}


function addFiles(files) {
    for (var i = 0, file; file = files[i]; i++) {
        console.log("upload", file)

        window.sendMessage("upload", {
            path: file,
            settings: JSON.stringify(defaultSettings),
            //id: files.list.indexOf(file)
            id: 0
        })

    }
}
window.addFiles = addFiles


const sendMessage = (type, payload = {}) => {
    window.server.send(JSON.stringify({
        type,
        payload
    }))
}
window.sendMessage = sendMessage


const saveFile = async (filePath, destination, filename, cb) => {

    let dest = destination
    let outPath
    if (destination == false) {
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
    } catch (e) {
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

ipcRenderer.on('shortcut', function (event, data) {
    console.log(data)

    switch (data.shortcut) {
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
            window.files.forEach(file => {
                if (file.status == "done" && file.endSize > file.startSize) {
                    window.deleteUUID(file.uuid)
                }
            });
            break;
    }

});


// Current version number recieved
ipcRenderer.on('version', (event, curVersion) => {

})


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
    if(file.Status === "done" || file.Status === "analyzed") {
        file.Status = "crushing"
        sendMessage("crush", {UUID, options: JSON.stringify(options)})
        window.fileCounts.crushing++
    }
}

window.clearAllFiles = function () {
    for (let file in window.files) {
        window.deleteUUID(file)
    }
}

window.deleteUUID = (UUID) => {
    const file = files[UUID]
    if(file.Status === "done" || file.Status === "analyzed" || file.Status === "error") {
        file.Status = "deleted"
        sendMessage("delete", UUID)
        window.fileCounts.total--
    }
}



window.popupMenu = (menu) => {
    ipcRenderer.send("popupMenu", {
        name: menu,
        X: 100,
        Y: 100
    })
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
        darkMode: false
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
                if(window.files[data.payload.file.UUID]) {
                    window.files[data.payload.file.UUID] = data.payload.file
                }
                //var id = window.getFile(data.payload.uuid)
                //if (id !== false) {
                //for (var key in data.payload.file) {
                //files.list[id][key] = data.payload.file[key]
                //}
                //id.Status = data.payload.file.status;
                //}
                break;
            case "upload":
                var id = data.payload.id;
                window.files[data.payload.file.UUID] = data.payload.file
                window.fileCounts.total++
                for (var key in data.payload.file) {
                    //files.list[id][key] = data.payload.file[key]
                }
                //files.list[id].setStatus(data.payload.file.status)
                break;
            case "replace":
                var id = files.getFileID(data.payload.oldUUID)
                for (var key in data.payload.file) {
                    files.list[id][key] = data.payload.file[key]
                }
                files.list[id].setStatus(data.payload.file.status)
                break;

        }
}


server.on('message', processMessage)



window.server = server
window.thisWindow = browser
window.openDialog = openDialog
window.saveFile = saveFile
window.GlobalSettings = []
window.getFile = (uuid) => {
    for (file of files) {
        if (file === uuid) {
            return files[file]
        }
    }
}