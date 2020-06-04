import { app, BrowserWindow, Tray, Menu, nativeImage } from 'electron';
import path from 'path';
import icon from './resources/Cat.png';

declare const ENVIRONMENT: String;

const IS_DEV = ENVIRONMENT == "development";
const DEV_SERVER_URL = "http://localhost:9000";
const HTML_FILE_PATH = "index.html";


let win: BrowserWindow | null = null;
let tray: Tray;


function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        },
        frame: false,
        resizable: false,
    });

    console.log(app.getAppPath());

    tray = createTray(path.join(app.getAppPath(), 'resources', 'Cat.png'));

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

function createTray(iconPath: string) {
    let trayIcon = nativeImage.createFromPath(iconPath);
    trayIcon = trayIcon.resize({
        width: 16,
        height: 16
    });
    let tray = new Tray(trayIcon);
    tray.setContextMenu(Menu.buildFromTemplate([
        { label: 'login' },
        { label: 'download snapshot' }
    ]));
    return tray;
}