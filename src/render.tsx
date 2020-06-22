import * as DOM from "react-dom";
import * as React from "react";
import App from "./App";
import electronLog from 'electron-log';

Object.assign(console, electronLog.functions);

DOM.render(<App />, document.getElementById("root"));
