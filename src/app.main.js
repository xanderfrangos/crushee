import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";

const files = []
window.files = files
window.stats = {}

window.eventState = {
    crushing: 0,
    saving: 0,
    analyzing: 0
}

window.changeEventState = (event, state, sendUpdate = true) => {
    window.eventState[event] = state
    if(sendUpdate) window.sendUpdate()
}

ReactDOM.render(<App />, document.getElementById("crushee"));

document.body.addEventListener("dragover", function (event) {
    // prevent default to allow drop

    event.dataTransfer.dropEffect = 'copy';
    event.preventDefault();
}, false);

document.body.addEventListener("drop", (event) => {
    event.preventDefault();
    let files = []
    for (let file of event.dataTransfer.files) {
        files.push(file.path)
    }
    window.addFiles(files)
}, false);


window.changeQualityLevel(2)
setTimeout(() => {
    if(window.appInfo.isAppX === false && window.GlobalSettings.App.updates) {
        fetch("https://api.github.com/repos/xanderfrangos/crushee/releases").then((response) => {
            response.json().then((json) => {
                if(json[0].tag_name != window.appInfo.version) {
                    window.appInfo.newVersion = json[0].tag_name
                    window.sendUpdate()
                }
            })
        });
    }
}, 1000)

window.thisWindow.on('resize', () => {
    window.sendUpdate()
})