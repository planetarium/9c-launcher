import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } from 'electron';
import path from 'path';
import { exec, ChildProcess } from 'child_process';
import { download } from 'electron-dl';
import trayImage from './resources/Cat.png'
import "@babel/polyfill"
import * as constant from './constant';

declare const ENVIRONMENT: String;

const IS_DEV = ENVIRONMENT == "development";


let win: BrowserWindow | null = null;
let tray: Tray;
let node: ChildProcess
let isQuiting: boolean = false;

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(app.getAppPath(), 'preload.js'),
        },
        frame: true,
        resizable: false,
        autoHideMenuBar: true,
    });

    console.log(app.getAppPath());


    if (IS_DEV) {
        win.loadURL(constant.DEV_SERVER_URL);
        win.webContents.openDevTools();
    }
    else {
        win.loadFile(constant.HTML_FILE_PATH);
    }

    win.on('minimize', function(event: any){
        event.preventDefault();
        win?.hide();
    });
    
    win.on('close', function (event: any) {
        if(!isQuiting){
            event.preventDefault();
            win?.hide();
        }
    });
}

app.on("ready", async () => {
    executeNode(path.join(app.getAppPath(), 'osx-x64', 'NineChronicles.Standalone.Executable'), ['--graphql-server=true'])
    //asp net 서버가 구동되기까지의 시간이 필요합니다.
    await setTimeout(function() {
        createWindow();
        createTray(path.join(app.getAppPath(), trayImage));
      }, 1500)
});

app.on('before-quit', (event) => {
    if(node != null) {
        node.kill('SIGTERM'); 
    }
});

app.on('activate', (event) => {
    event.preventDefault();
    win?.show();
})

ipcMain.on("download snapshot", (event, info) => {
    info.properties.onProgress = (status: any) => win?.webContents.send("download progress", status);
    info.properties.directory = constant.SNAPSHOT_SAVE_PATH
    console.log(win);
    if (win != null) {
        download(win, constant.SNAPSHOT_DOWNLOAD_PATH, info.properties)
            .then(dl => {win?.webContents.send("download complete", dl.getSavePath()); console.log(dl)});
    }
});

ipcMain.on("launch game", (event, info) => {
    execute(path.join(
        app.getAppPath(), 
        process.platform === 'darwin' 
            ? constant.MAC_GAME_PATH
            : constant.WIN_GAME_PATH
        ), info.args)
})

async function executeNode(binaryPath: string, args: string[]) {
    execute(`${binaryPath}`, args);
}

function execute(binaryPath: string, args: string[]) {
    node = exec(`${binaryPath} ${args.join(' ')}`, (error, stdout, stderr) => {
        if(error) win?.webContents.send('error popup', error);
        if(stdout) console.log(`child process stdout: ${stdout}`);
        if(stderr) console.error(`child process stderr: ${stderr}`);
    })
}

function createTray(iconPath: string) {
    let trayIcon = nativeImage.createFromPath(iconPath);
    trayIcon = trayIcon.resize({
        width: 16,
        height: 16
    });
    tray = new Tray(trayIcon);
    tray.setContextMenu(Menu.buildFromTemplate([
        { label: 'Open Window', click: function(){
            win?.show()
        }},
        { label: 'Quit Launcher', click: function(){
            isQuiting = true;
            app.quit();
        }},
   ]));
    return tray;
}
