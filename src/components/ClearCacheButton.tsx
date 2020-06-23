import * as React from 'react';

import { ipcRenderer } from 'electron';
import { Button } from '@material-ui/core';

const ClearCacheButton = () => {
    const handleClick = () => {
        ipcRenderer.send('clear cache');
    }

    return (
        <Button
            onClick={() => handleClick()}
            variant="contained"
            color="secondary">
            Clear Cache
        </Button>
    )
}

export default ClearCacheButton
