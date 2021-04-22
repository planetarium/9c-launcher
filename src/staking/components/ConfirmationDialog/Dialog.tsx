import { Dialog, DialogTitle, Typography } from "@material-ui/core";
import React from "react";


type Props = {
    open: boolean;
}

const ConfirmationDialog: React.FC<Props> = (props: Props) => {
    const { open } = props;

    return (
        <Dialog
        disableBackdropClick
        disableEscapeKeyDown
         aria-labelledby="confirmation-dialog-title" open={open}>
            <DialogTitle id="confirmation-dialog-title">Transaction...</DialogTitle>
            <Typography>
                Now confirm your transaction... please wait...
            </Typography>
        </Dialog>
    );
}

export default ConfirmationDialog;
