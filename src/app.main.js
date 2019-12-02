import React from "react";
import ReactDOM from "react-dom";
import { App } from "./components/App";

const files = []
window.files = files

ReactDOM.render(<App />, document.getElementById("crushee"));

document.body.addEventListener("dragover", function (event) {
    // prevent default to allow drop
    console.log("drag", event, event.dataTransfer.files)
    event.dataTransfer.dropEffect = 'copy';
    event.preventDefault();
}, false);

document.body.addEventListener("drop", (event) => {
    event.preventDefault();
    console.log("dropFiles", event.dataTransfer.files, event.dataTransfer.items)
    let files = []
    for(let file of event.dataTransfer.files) {
        console.log(file)
        files.push(file.path)
    }
    window.addFiles(files)
}, false);