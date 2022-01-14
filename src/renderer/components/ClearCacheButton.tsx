import React, { useState } from "react";
import { ipcRenderer, remote } from "electron";
import {
  Button,
  ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  TextField,
} from "@material-ui/core";
import { t } from "@transifex/native";
import { T } from "@transifex/react";
import DeleteIcon from "@material-ui/icons/Delete";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";

interface IClearCacheButtonProps extends ButtonProps {
  disabled?: boolean;
}

const ClearCacheButton = (props: IClearCacheButtonProps) => {
  const [isCleared, setClearState] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirmText.toLowerCase() === "clear cache") {
      setConfirmOpen(false);
      const result = await ipcRenderer.invoke("clear cache", true);
      setClearState(result);
    } else {
      alert(t("Please type correctly"));
    }
  };
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleClickOpen = () => {
    setConfirmOpen(true);
  };

  const handleClose = () => {
    setConfirmOpen(false);
  };

  return (
    <>
      <Button
        color="default"
        variant="text"
        {...props}
        startIcon={isCleared ? <CheckCircleIcon /> : <DeleteIcon />}
        disabled={props.disabled}
        onClick={handleClickOpen}
      />
      <Dialog open={confirmOpen} onClose={handleClose}>
        <form noValidate autoComplete="off" onSubmit={handleSubmit}>
          <FormControl>
            <DialogContent>
              <DialogTitle>
                <T _str="Are you absolutely sure?" />
              </DialogTitle>
              <DialogContentText>
                <p>
                  <T _str="All local chain data will be deleted and re-downloaded again. This process can take up to 30 minutes. Are you sure to continue?" />
                </p>
                <p>
                  <T
                    _str="Please type {clearCache} to confirm."
                    clearCache={<b>Clear Cache</b>}
                  />
                </p>
              </DialogContentText>
              <TextField
                margin="dense"
                id="confirm"
                placeholder="Clear Cache"
                onChange={(e) => setConfirmText(e.target.value)}
                type="text"
                color="primary"
                fullWidth
                variant="standard"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>
                <T _str="Cancel" />
              </Button>
              <Button type="submit">
                <T _str="OK" />
              </Button>
            </DialogActions>
          </FormControl>
        </form>
      </Dialog>
    </>
  );
};

export default ClearCacheButton;
