const { ipcRenderer: ipc } = require('electron');

function sendSettings(newSettings) {
    ipc.send('send-settings', newSettings)
}

function requestSettings() {
    ipc.send('request-settings')
}

function openURL(url) {
    ipc.send('open-url', url)
}

window.setWindowState = function(state) {
    ipc.send('setWindowState', state)
}

window.isMaximized = async function() {
    return ipc.invoke('isMaximized')
}

ipc.on('settings-updated', (event, settings) => {
    window.settings = settings
    window.dispatchEvent(new CustomEvent('settingsUpdated', {
        detail: settings
    }))
})

// Request startup data
window.addEventListener('load', () => {
    requestSettings()
});

window.sendSettings = sendSettings
window.requestSettings = requestSettings
window.openURL = openURL
window.lastUpdate = Date.now()
window.settings = {}