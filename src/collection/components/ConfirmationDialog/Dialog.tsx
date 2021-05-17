import { Dialog, DialogTitle, makeStyles, Typography } from "@material-ui/core";
import React from "react";
import loadingIcon from "../../common/resources/ui-staking-loading.png";

import "./Dialog.scss";

export type Props = {
  open: boolean;
};

const ConfirmationDialog: React.FC<Props> = (props: Props) => {
  const { open } = props;

  return (
    <Dialog
      disableBackdropClick
      disableEscapeKeyDown
      aria-labelledby="confirmation-dialog-title"
      open={open}
      PaperProps={{
        style: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
        },
      }}
    >
      <div className="ConfirmationDialogContainer">
        <div className="ConfirmationDialogLabelContainer">
          <img src={loadingIcon} />
          <div className="label">Processing Collecting...</div>
        </div>
      </div>
    </Dialog>

  );
};

export default ConfirmationDialog;
