import React, { useReducer } from "react";
import { observer } from "mobx-react";
import { t } from "@transifex/native";
import {
  Button,
  IconButton,
  Snackbar,
  SnackbarContent,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { shell } from "electron";
import { makeStyles } from "@material-ui/core/styles";
import { T } from "../i18n";
import noticeIcon from "src/renderer/resources/noticeTest.png";

const useStyles = makeStyles({
  anchor: {
    minWidth: "90%",
  },
  root: {
    backgroundColor: "rgba(40, 48, 88, .95)",
    color: "white",
    flexGrow: 1,
  },
  button: {
    color: "rgb(77, 108, 255)",
  },
  buttonLabel: {
    lineHeight: 1,
  },
  icon: {
    verticalAlign: "middle",
    marginRight: 8,
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
      className={styles.anchor}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      open={opened}
    >
      <SnackbarContent
        className={styles.root}
        message={
          <>
            <img src={noticeIcon} alt="" className={styles.icon} />
            <T
              _str="Item level requirement system will be updated."
              _tags="topBanner"
            />
          </>
        }
        action={
          <>
            <Button
              color="primary"
              size="small"
              onClick={learnMoreHandler}
              classes={{ label: styles.buttonLabel, root: styles.button }}
            >
              {t("Learn more", { _tags: "topBanner" })}
            </Button>
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={close}
              className={styles.button}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </>
        }
      />
    </Snackbar>
  );
}

export default observer(TopBanner);
