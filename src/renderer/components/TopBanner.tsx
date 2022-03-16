import React, { useReducer } from "react";
import { observer } from "mobx-react";
import { t } from "@transifex/native";
import { Button, IconButton, Snackbar } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { shell } from "electron";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  topBanner: {
    minWidth: "100%",
    top: 0,
    "& .MuiSnackbarContent-root": {
      flexGrow: 1,
      borderRadius: 0,
    },
  },
});

function TopBanner() {
  const [opened, close] = useReducer(() => false, true);
  const styles = useStyles();
  const learnMoreHandler = () => {
    shell.openExternal(
      "https://ninechronicles.medium.com/item-level-requirements-3f5936733007"
    );
    close();
  };
  return (
    <Snackbar
      className={styles.topBanner}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      open={opened}
      message={t("Item level requirement system will be updated.", {
        _tags: "topBanner",
      })}
      action={
        <>
          <Button color="primary" size="small" onClick={learnMoreHandler}>
            {t("Learn more", { _tags: "topBanner" })}
          </Button>
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={close}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </>
      }
    />
  );
}

export default observer(TopBanner);
