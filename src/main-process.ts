import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } from 'electron';
import path from 'path';
import { exec, ChildProcess } from 'child_process';
import { download } from 'electron-dl';

declare const ENVIRONMENT: String;

const IS_DEV = ENVIRONMENT == "development";
const DEV_SERVER_URL = "http://localhost:9000";
const HTML_FILE_PATH = "index.html";
const SNAPSHOT_DOWNLOAD_PATH = "https://9c-test.s3.ap-northeast-2.amazonaws.com/snapshots/2be5da279272a3cc2ecbe329405a613c40316173773d6d2d516155d2aa67d9bb-snapshot-202000525.zip";
const SNAPSHOT_SAVE_PATH = undefined;


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
            preload: path.join(app.getAppPath(), 'preload.js')
        },
        frame: false,
        resizable: false,
    });

    console.log(app.getAppPath());


    if (IS_DEV) {
        win.loadURL(DEV_SERVER_URL);
        win.webContents.openDevTools();
    }
    else {
        win.loadFile(HTML_FILE_PATH);
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

app.on("ready", () => {
    executeNode(path.join(app.getAppPath(), 'netcoreapp3.1', 'NineChronicles.Standalone.Executable.dll'), ['--graphql-server=true'])
    createWindow();
    // 여기도 file-loader 써서 집어넣자
    createTray(path.join(app.getAppPath(), 'resources', 'Cat.png'));
});

// app.on('window-all-closed', () => {
//     if (process.platform !== 'darwin') {
//         app.quit()
//     }
// })

app.on('before-quit', (event) => {
    node.kill('SIGKILL'); 
});

app.on('activate', (event) => {
    event.preventDefault();
    win?.show();
})

ipcMain.on("download snapshot", (event, info) => {
    info.properties.onProgress = (status: any) => win?.webContents.send("download progress", status);
    info.properties.directory = SNAPSHOT_SAVE_PATH
    console.log(win);
    if (win != null) {
        download(win, SNAPSHOT_DOWNLOAD_PATH, info.properties)
            .then(dl => {win?.webContents.send("download complete", dl.getSavePath()); console.log(dl)});
    }
});

function executeNode(binaryPath: string, arg: string[]) {
    console.log()
    node = exec(`dotnet ${binaryPath} ${arg.join(' ')}`, (error, stdout, stderr) => {
        if(error) console.error(`exec error: ${error}`);
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
        }}
    ]));
    return tray;
}