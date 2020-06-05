import { app, BrowserWindow, Tray, Menu, nativeImage } from 'electron';
import path from 'path';
import { exec, ChildProcess } from 'child_process';

declare const ENVIRONMENT: String;

const IS_DEV = ENVIRONMENT == "development";
const DEV_SERVER_URL = "http://localhost:9000";
const HTML_FILE_PATH = "index.html";


let win: BrowserWindow | null = null;
let tray: Tray;
let node: ChildProcess
let isQuiting: boolean = false;

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
    let tray = new Tray(trayIcon);
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