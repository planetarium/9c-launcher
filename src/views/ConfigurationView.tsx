import * as React from 'react';
import { useState } from 'react';
import { IStoreContainer } from '../interfaces/store';
import { LinearProgress, Button } from '@material-ui/core';
import { observer, inject } from 'mobx-react';
import DownloadSnapshotButton from '../components/DownloadSnapshotButton';
import ClearCacheButton from '../components/ClearCacheButton';

const ConfigurationView = observer(({accountStore, routerStore}: IStoreContainer ) => {
    const [isDownloading, setDownloadState] = useState(false);
    const [isExtracting, setExtractState] = useState(false);
    const [progress, setProgress] = useState(0);

    console.log(`downloading: ${isDownloading}, extracting: ${isExtracting}`)
    return (
        <div>
            <Button
                disabled={ isDownloading || isExtracting}
                onClick={() => routerStore.push('/')} 
                variant="contained"
                color="primary"> 
                    Back to Home
            </Button>
            <br />
            <DownloadSnapshotButton
                setExtractState={setExtractState}
                setDownloadState={setDownloadState}
                progress={progress}
                setProgress={setProgress} />
            <br />
            <ClearCacheButton />
            <br/>
            {isDownloading || isExtracting ? <LinearProgress variant="determinate" value={progress} /> : null}
        </div>
    )
});

export default inject('accountStore', 'routerStore')(ConfigurationView)
