import { Dialog } from "@material-ui/core";
import React from "react";
import CollectionButton from "../Button/Button";

import "./RenewDialog.scss";

export type Props = {
  open: boolean;
  onCancel: () => void;
  onSubmit: () => void;
};

const RenewDialog: React.FC<Props> = (props: Props) => {
  const { open, onCancel, onSubmit } = props;

  return (
    <Dialog
      disableBackdropClick
      disableEscapeKeyDown
      aria-labelledby="renew-dialog-title"
      open={open}
      PaperProps={{
        style: {
          backgroundColor: "transparent",
          boxShadow: "none",
          maxWidth: "770px",
          height: "150px",
        },
      }}
    >
      <div className="RenewDialogContainer">
        <div className="RenewDialogInfomation">
          If you modify the setting,
          <br />
          the reward schedule and amount automatically renewed.
        </div>
        <div className="RenewDialogButtonContainer">
          <CollectionButton width={200} height={50} onClick={onCancel}>
            Cancel
          </CollectionButton>
          <CollectionButton
            width={200}
            height={50}
            primary={true}
            onClick={onSubmit}
          >
            Ok
          </CollectionButton>
        </div>
      </div>
    </Dialog>
  );
};

export default RenewDialog;
