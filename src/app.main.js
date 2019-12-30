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

window.changeEventState = (event, state) => {
    window.eventState[event] = state
    window.sendUpdate()
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

