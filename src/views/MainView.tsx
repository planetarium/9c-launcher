import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import * as React from 'react';
import { useState } from 'react';

const { ipcRenderer } = window

export default function MainView(props: any) {
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

    const executeGame = () => {
    }

    const downloadSnapShot = () => {
        ipcRenderer.send("download snapshot", {
            properties: {}
        });
        console.log('hello world!')
    }

    return (
        <div>
            <button onClick={(event: React.MouseEvent) => { executeGame() }}>Start Game</button>
            <button onClick={(event: React.MouseEvent) => { downloadSnapShot() }}>Download Snapshot</button>
            <br />
            {isDownloaded ? <label>{progressPercentages}</label> : null}
        </div>
    );
}