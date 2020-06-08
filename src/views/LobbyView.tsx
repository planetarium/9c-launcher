import * as React from 'react';
import { useState } from 'react';

const { ipcRenderer } = window

export default function LobbyView(props: any) {
    const [isDownloaded, setDownloadState] = useState(false);
    const [progressPercentages, setProgressPercentages] = useState(0);

    ipcRenderer.on("download progress", (event, progress) => {
        setDownloadState(true);
        setProgressPercentages(progress.percent * 100);
        console.log(progress);
    });
    ipcRenderer.on("download complete", (event, path) => {
        setDownloadState(false);
    })
    ipcRenderer.on("error popup", (event, message) => {
        console.log(message);
    })

    const executeGame = () => {
        ipcRenderer.send("launch game", {
            args: [
                `--privateKey=${props.privateKey}`
            ]
        })
    }

    const downloadSnapShot = () => {
        ipcRenderer.send("download snapshot", {
            properties: {}
        });
    }

    return (
        <div>
            <label>You are using address: {props.address}</label><br/>
            <button disabled={isDownloaded} onClick={(event: React.MouseEvent) => { executeGame() }}>Start Game</button>
            <button onClick={(event: React.MouseEvent) => { downloadSnapShot() }}>Download Snapshot</button>
            <br />
            {isDownloaded ? <label>{progressPercentages}</label> : null}
        </div>
    );
}