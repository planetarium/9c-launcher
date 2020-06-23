import * as React from 'react';

import { ipcRenderer } from 'electron';
import { Container, Button } from '@material-ui/core';

const ClearChche = () => {
    return (
        <Button
            onClick={() => console.log('clear cache!')}
            variant="contained"
            color="secondary">
            Clear Cache
        </Button>
    )
}

export default ClearChche