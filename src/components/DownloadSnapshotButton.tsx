import * as React from 'react';

import { ipcRenderer, IpcRendererEvent } from 'electron';
import { Button } from '@material-ui/core';

interface IDownloadSnaphostProps {
    setExtractState: React.Dispatch<React.SetStateAction<boolean>>
    setDownloadState: React.Dispatch<React.SetStateAction<boolean>>
    progress: number,
    setProgress: React.Dispatch<React.SetStateAction<number>> 
}

const DownloadSnapshotButton = (props: IDownloadSnaphostProps) => {

    ipcRenderer.on("extract progress", (event, progress) => {
        props.setExtractState(true);
        props.setProgress(progress * 100);
    })

    ipcRenderer.on("extract complete", (event) => {
        props.setExtractState(false);
    })

    ipcRenderer.on("download progress", (event: IpcRendererEvent, progress: IDownloadProgress) => {
        props.setDownloadState(true);
        props.setProgress(progress.percent * 100);
    });

    ipcRenderer.on("download complete", (event: IpcRendererEvent, path: string) => {
        props.setDownloadState(false);
    });

    const downloadSnapShot = () => {
        const options: IDownloadOptions = {
            properties: {}
        }
        ipcRenderer.send("download snapshot", options);
    };
    return <Button
            onClick={(event: React.MouseEvent) => { downloadSnapShot() }}
            variant="contained"
            color="primary">
                Download Snapshot
           </Button>
}

export default DownloadSnapshotButton;
