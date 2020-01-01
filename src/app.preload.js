const { ipcRenderer: ipc, remote, Menu, MenuItem, BrowserWindow, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const { fork } = require("child_process")
const uuidv1 = require('uuid/v1');
const { dialog } = require('electron').remote
const slash = require('slash')
let browser = remote.getCurrentWindow()

window.appInfo = {
    version: 'v' + remote.app.getVersion(),
    isAppX: (remote.app.name == "crushee-appx" ? true : false),
    newVersion: false
}

console.log("Starting optimizer...")
let server = fork(path.join(__dirname, "../src/optimizer/server.js"))

remote.app.on("will-quit", () => {
    server.send({ type: "quit" })
})

function openDialog(isFolder = false) {

    const params = {
        title: "Select image(s)",
        filters: [
            { name: 'Images', extensions: ['jpg', 'png', 'gif', 'svg'] },
            { name: 'All Files', extensions: ['*'] }
        ],
        buttonLabel: (isFolder == true ? 'Add Folder(s)' : 'Add File(s)'),
        properties: [
            'openFile',
            'multiSelections'
        ]
    }

    if (isFolder == true) {
        params.properties.push('openDirectory')
    }

    dialog.showOpenDialog(params).then((returned) => {
        const files = returned.filePaths
        if (files == undefined)
            return false;

        window.addFiles(files)
    })
}

function saveDialog(isFolder = false, extension = null) {
    if (isFolder) {
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

            if (files.length === 1) {
                window.saveAllFiles(files[0])
            } else {
                console.log("Length not 1")
                return false;
            }
        })
    } else {
        let settings = {
            title: "Save as",
            buttonLabel: 'Save file',
            defaultPath: window.files[window.rightClickTarget].In.FileName
        }
        if (extension) {
            settings.filters = [{
                name: extension,
                extensions: [extension.substr(1)]
            }]
        }
        dialog.showSaveDialog(settings).then((returned) => {
            if (returned.filePath) {
                window.saveFiles([window.rightClickTarget], path.dirname(returned.filePath), path.basename(returned.filePath))
            }


        })
    }
}


function setDockBadge(count) {
    if (process.platform === 'darwin') {
        //Coerce count into a string. Passing an empty string makes the badge disappear.
        remote.app.dock.setBadge('' + (count || ''));
    }
}
window.setDockBadge = setDockBadge


window.updateTaskbarPercentage = function() {
    let progress = 1 - ((window.stats.processing + window.stats.crushing + window.stats.saving) / window.stats.total)
    if(progress >= 1) progress = 0;
    if(typeof progress != "number") progress = 0;
    window.thisWindow.setProgressBar(progress || 0)
}

ipcRenderer.on('shortcut', function (event, data) {

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
            for (let UUID in window.files) {
                const file = window.files[UUID]
                console.log(file)
                if ((file.Status == "done" && file.In.FileSize <= file.Out.FileSize) || file.Status == "analyzed" || file.Status == "error") {
                    console.log(UUID)
                    window.deleteUUID(UUID, false)
                }
            }
            window.sendUpdate()
            break;
        case "right-click-save":
            window.saveFiles(window.rightClickTarget)
            break;
        case "right-click-save-as":
            saveDialog(false, window.files[window.rightClickTarget].In.Extension)
            break;
        case "right-click-crush":
            window.crushFile(window.rightClickTarget, window.GlobalSettings.Quality)
            break;
        case "right-click-show-original":
            remote.shell.showItemInFolder(window.files[window.rightClickTarget].In.Source)
            break;
        case "right-click-remove":
            window.deleteUUID(window.rightClickTarget, true)
            break;
        case "right-click-compare":
            window.showComparison(window.files[window.rightClickTarget])
            break;
    }

});

window.popupMenu = (menu, x = null, y = null, disable = false) => {
    ipcRenderer.send("popupMenu", {
        menu,
        x,
        y,
        disable
    })
}


function addFiles(files) {

    window.sendMessage("upload", {
        path: files
    })
}
window.addFiles = addFiles


const sendMessage = (type, payload = {}) => {
    window.server.send({
        type,
        payload
    })
}
window.sendMessage = sendMessage



server.on('message', processMessage)



window.server = server
window.thisWindow = browser
window.openDialog = openDialog


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
        sendMessage("crush", { UUID, options })
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
    if (sendUpdate) {
        window.sendUpdate()
    }
}

window.saveFiles = (files, directory = false, filename = false) => {
    // Force the "saving" screen on early to prevent the rendering thread from getting too busy
    let first = true
    for (let UUID of files) {
        window.files[UUID].Status = "saving"
        if (first) {
            first = false
            sendUpdate(false)
        }
    }
    sendUpdate()
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
        if (file.Status == "done") {
            fileList.push(UUID)
        }
    }
    window.saveFiles(fileList, folder)
}


window.openWebsite = function () {
    require("electron").shell.openExternal("https://crushee.app/?app")
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
        },
        gif: {
            colors: 64
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
        },
        gif: {
            colors: 128
        }
    },
    // High
    {
        jpg: {
            quality: 94,
            subsampling: 2,
            useOriginal: true
        },
        png: {
            qualityMin: 15,
            qualityMax: 95
        },
        webp: {
            quality: 92
        },
        gif: {
            colors: 200
        }
    },
    // Lossless-ish
    {
        jpg: {
            quality: 95,
            subsampling: 1,
            useOriginal: true
        },
        png: {
            qualityMin: 25,
            qualityMax: 98
        },
        webp: {
            quality: 95
        },
        gif: {
            colors: 256
        }
    },
]
window.qualityPresets = qualityPresets

const changeQualityLevel = (level) => {
    if (level != window.GlobalSettings.Quality.app.qualityPreset) {
        window.GlobalSettings.Quality.app.qualityPreset = level
        window.GlobalSettings.Quality.jpg = Object.assign(window.GlobalSettings.Quality.jpg, qualityPresets[level].jpg)
        window.GlobalSettings.Quality.png = Object.assign(window.GlobalSettings.Quality.png, qualityPresets[level].png)
        window.GlobalSettings.Quality.webp = Object.assign(window.GlobalSettings.Quality.webp, qualityPresets[level].webp)
        window.GlobalSettings.Quality.gif = Object.assign(window.GlobalSettings.Quality.gif, qualityPresets[level].gif)
        window.sendUpdate(false)
    }
}

window.changeQualityLevel = changeQualityLevel


let scanList = 0

function processMessage(ev) {
    var data = ev
    if (typeof data.type != "undefined")
        switch (data.type) {
            case "check":
                checkUUIDs(data.payload);
                break;
            case "update":
                if (window.files[data.payload.file.UUID]) {
                    if (data.payload.file.Status !== "deleted") {
                        window.files[data.payload.file.UUID] = data.payload.file
                    }
                    if (data.payload.file.Status === "done") {
                        window.changeEventState("saving", 0, false)
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
                window.changeEventState("crushing", 0, false)
                window.changeEventState("saving", 0, false)
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
            case "saved":
                if (window.files[data.payload.UUID]) {
                    window.files[data.payload.UUID].Status = (data.payload.saved ? "done" : "error")
                }
                sendUpdate(false)
                break;
            case "scanStart":
                scanList++
                sendScanUpdate()
                break;
            case "scanEnd":
                delete scanList--
                sendScanUpdate()
                break;

        }
}


let updateThrottle = false;
let updatePressure = 0
const sendUpdate = (throttle = true) => {

    if (!throttle) {
        window.dispatchEvent(new CustomEvent('filesUpdated', {
            detail: {
                ts: Date.now()
            }
        }))
    } else if (updateThrottle === false) {
        updatePressure++
        updateThrottle = setTimeout(() => {
            window.sendUpdate(false)
            updateThrottle = false
            updatePressure = 0
        }, (updatePressure > 1 ? 250 : 17))
    }


}
window.sendUpdate = sendUpdate


const sendScanUpdate = () => {
    window.dispatchEvent(new CustomEvent('scanUpdated', {
        detail: {
            count: scanList
        }
    }))
}

const sendPreviewUpdate = (show = false, before = false, after = false) => {
    window.dispatchEvent(new CustomEvent('previewUpdated', {
        detail: {
            show,
            before,
            after
        }
    }))
}
window.sendPreviewUpdate = sendPreviewUpdate


const showComparison = (file) => {
    if (file.Status === "done") {
        window.sendPreviewUpdate(true, "file://" + file.Path + "/source" + file.In.Extension + "?" + Date.now(), "file://" + file.Path + "/crushed/" + file.Out.Crushed + "?" + Date.now())
    }
}
window.showComparison = showComparison


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