import React from "react";
import { LinearProgress, withStyles, createStyles } from "@material-ui/core";

import PlanetariumLogoImage from "../../resources/planetarium-logo-hor.png";
import NineChroniclesLogoImage from "../../resources/nine-chronicles-logo.png";
import NineChroniclesLogoIconImage from "../../resources/nine-chronicles-logo-icon.png";
import DiscordIconImage from "../../resources/discord-icon-32x32.png";

import UpdateViewStyle from "./UpdateView.style";

type UpdateViewProps = {
  state: "download" | "extract" | "copy";
  variant: "indeterminate" | "determinate" | undefined;
  progress: number;
};

const UpdateView = ({ state, variant, progress }: UpdateViewProps) => {
  // FIXME: Some files were downloaded multiple times because of improper file lock, causing progress to go backward.

  const styles = UpdateViewStyle();
  const StyledLinearProgress = withStyles(() =>
    createStyles({
      root: {
        width: "100%",
        height: 11,
        position: "absolute",
        bottom: 0,
      },
      colorPrimary: {
        backgroundColor: "rgba(216, 216, 216, 0.8)",
      },
      bar: {
        backgroundColor: "#20d1c2",
      },
    })
  )(LinearProgress);

  const progressToString =
    variant === "determinate" ? ` ${Math.round(progress)}%` : "";

  let progressMessage;
  switch (state) {
    case "copy":
      progressMessage = "Copying files...";
      break;
    case "download":
      progressMessage = `Downloading the new version...${progressToString}`;
      break;
    case "extract":
      progressMessage = `Extracting the new version...${progressToString}`;
      break;
  }

  return (
    <div className={styles.root}>
      <img src={PlanetariumLogoImage} className={styles.planetariumLogo} />
      <img
        src={NineChroniclesLogoImage}
        className={styles.nineChroniclesLogo}
      />
      <div className={styles.menu}>
        <a
          href="https://forum.nine-chronicles.com/"
          target="_blank"
          rel="noreferrer"
        >
          <div className={styles.menuItem}>
            <img
              src={NineChroniclesLogoIconImage}
              style={{ width: 25, height: 27 }}
            />
          </div>
        </a>
        <a
          href="https://bit.ly/planetarium-discord"
          target="_blank"
          rel="noreferrer"
        >
          <div className={styles.menuItem} style={{ marginTop: 10 }}>
            <img src={DiscordIconImage} style={{ width: 32, height: 32 }} />
          </div>
        </a>
      </div>
      <div className={styles.progressMessage}>{progressMessage}</div>
      <StyledLinearProgress variant={variant} value={progress} />
    </div>
  );
};

export default UpdateView;
