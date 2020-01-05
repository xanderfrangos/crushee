import React from "react";
import ReactDOM from "react-dom";
import SettingsWindow from "./Components/SettingsWindow";

window.GlobalSettings = {
    Quality: {
        app: {}
    }
}

ReactDOM.render(<SettingsWindow theme={window.settings.theme} />, document.getElementById("settings"));