const { ipcRenderer: ipc, remote } = require('electron');
let browser = remote.getCurrentWindow()

function sendSettings(newSettings) {
    ipc.send('send-settings', newSettings)
}

function requestSettings() {
    ipc.send('request-settings')
}

function openURL(url) {
    ipc.send('open-url', url)
}

ipc.on('settings-updated', (event, settings) => {
    window.settings = settings
    window.dispatchEvent(new CustomEvent('settingsUpdated', {
        detail: settings
    }))
})

// Request startup data
browser.webContents.once('dom-ready', () => {
    requestSettings()
})

window.sendSettings = sendSettings
window.requestSettings = requestSettings
window.openURL = openURL
window.lastUpdate = Date.now()
window.settings = {}
window.thisWindow = browser

window.version = 'v' + remote.app.getVersion()
window.isAppX = (remote.app.name == "crushee-appx" ? true : false)