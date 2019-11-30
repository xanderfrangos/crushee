import React from "react";
import ReactDOM from "react-dom";
import { App } from "./components/App";

const files = []
window.files = files

ReactDOM.render(<App />, document.getElementById("crushee"));