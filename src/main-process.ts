import { app, BrowserWindow } from "electron";

declare const ENVIRONMENT: String;

const IS_DEV = ENVIRONMENT == "development";
const DEV_SERVER_URL = "http://localhost:9000";
const HTML_FILE_PATH = "index.html";


let win: BrowserWindow | null = null;


function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    if (IS_DEV) {
        win.loadURL(DEV_SERVER_URL);
        win.webContents.openDevTools();
    }
    else {
        win.loadFile(HTML_FILE_PATH);
    }


    win.on("closed", () => {
        win = null
    })
}

app.on("ready", () => {
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})
