import React from "react";
import { observer } from "mobx-react";
import { GetAvatarAddressQuery } from "src/generated/graphql";

import Button, { ButtonBar } from "src/renderer/components/ui/Button";
import { styled, Box } from "@material-ui/core";
import { T } from "src/renderer/i18n";
import OverlayBase, {
  CloseButton,
} from "src/renderer/components/core/OverlayBase";
import { OverlayProps } from "src/utils/types";
import H1 from "src/renderer/components/ui/H1";
import { MigrateCollectionRewardsOverlayProps } from ".";

const transifexTags = "v2/views/MigrateCollectionRewardsOverlay";

const Description = {
  textShadow: "0px 2px 2px rgba(0, 0, 0, 0.5)",
  textAlign: "center" as const,
  fontSize: "20px",
  paddingBottom: "2.5rem",
};

const MigrateCollectionRewardsOverlayBase = styled(OverlayBase)({
  "&&": {
    width: "500px",
    height: "auto",
    backgroundColor: "#1d1e1f",
    margin: "20vh auto",
    padding: "2rem",
    display: "flex",
    gap: "0.5rem",
    flexDirection: "column",
    alignItems: "center",
    color: "white",
  },
});

function ClaimContent({
  onConfirm,
  onClose,
  isOpen,
}: MigrateCollectionRewardsOverlayProps) {
  return (
    <MigrateCollectionRewardsOverlayBase isOpen={isOpen} onDismiss={onClose}>
      <CloseButton
        onClick={() => {
          onClose();
        }}
      />
      <H1>
        <T _str="Warning" _tags={transifexTags} />
      </H1>
      <Box style={Description}>
        <b>If you migrate,</b>
        <br />
        <b>
          the reward claim cycle gets{" "}
          <span style={{ color: "#ff4343" }}>reset</span>
          <br />
          and you need to wait 7 days to claim.
        </b>
        <br />
        <br />
        Also, deposits cannot be withdrawn within 28 days.
      </Box>
      <Box>
        <ButtonBar placement="bottom">
          <Button onClick={() => onClose()}>
            <T _str="Cancel" _tags={transifexTags} />
          </Button>
          <Button variant="primary" onClick={() => onConfirm()}>
            <T _str="Confirm" _tags={transifexTags} />
          </Button>
        </ButtonBar>
      </Box>
    </MigrateCollectionRewardsOverlayBase>
  );
}

export default observer(ClaimContent);
