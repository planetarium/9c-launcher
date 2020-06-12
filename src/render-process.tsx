import * as DOM from "react-dom";
import * as React from "react";
import App from "./App";
const Elog = window.require('electron-log')
Object.assign(console, Elog.functions);

DOM.render(<App />, document.getElementById("root"));
