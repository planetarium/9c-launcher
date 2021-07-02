import { Dialog } from "@material-ui/core";
import React from "react";
import loadingIcon from "../../common/resources/staking_ani3.png";

import "./LoadingDialog.scss";

export type Props = {
  open: boolean;
};

const LoadingDialog: React.FC<Props> = (props: Props) => {
  const { open } = props;

  return (
    <Dialog
      disableBackdropClick
      disableEscapeKeyDown
      aria-labelledby="loading-dialog-title"
      open={open}
      PaperProps={{
        style: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
        },
      }}
    >
      <div className="LoadingDialogContainer">
        <div className="LoadingDialogLabelContainer">
          <img src={loadingIcon} />
          <div className="label">Processing Collecting...</div>
        </div>
      </div>
    </Dialog>

  );
};

export default LoadingDialog;
