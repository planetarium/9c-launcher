import React from "react";
import {
  AlertBase,
  AlertButton,
  AlertButtonBar,
  AlertDescription,
  AlertHeader,
  AlertTitle,
  MigrationAlert,
  MigrationAlertBase,
  MigrationAlertHeader,
  MigrationAlertItem,
  MigrationAlertItemDetails,
  MigrationAlertItemTitle,
} from "./dialog";

import infoIcon from "src/v2/resources/collection/mark-information.png";
import ncgIcon from "src/v2/resources/collection/items/ncg.png";
import { T } from "@transifex/react";

export default {
  title: "MonsterCollection/Alert",
  component: AlertBase,
};

export const Confirmation = () => (
  <AlertBase as="main">
    <AlertHeader>
      <img src={infoIcon} />
      <AlertTitle as="div">Information</AlertTitle>
    </AlertHeader>
    <AlertDescription as="div">
      Do you really want to reduce your deposit?
      <br />
      The rewards will be lowered, and all the deposit periods for long-term
      compensation will be reset.
    </AlertDescription>
    <AlertButtonBar>
      <AlertButton>Cancel</AlertButton>
      <AlertButton variant="primary">OK</AlertButton>
    </AlertButtonBar>
  </AlertBase>
);

export const Migration = () => (
  <MigrationAlertBase as="main">
    <MigrationAlertHeader>
      <MigrationAlertItemTitle>Deposit amount</MigrationAlertItemTitle>
      <MigrationAlertItemDetails>
        <strong>
          <img src={ncgIcon} />
          500
        </strong>
      </MigrationAlertItemDetails>
      <MigrationAlertItemTitle>Duration of progress</MigrationAlertItemTitle>
      <MigrationAlertItemDetails>
        <span>
          <strong>365</strong> days <br />
          123456789 blocks
        </span>
      </MigrationAlertItemDetails>
    </MigrationAlertHeader>
    <AlertDescription as="div">
      Monster collection has been improved to be more convenient and softer.
      Receive the previously accumulated rewards and return them to the same
      form as before. Moving on to the new monster collection?
    </AlertDescription>
    <AlertButtonBar>
      <AlertButton variant="primary">Claim & Migrate</AlertButton>
    </AlertButtonBar>
  </MigrationAlertBase>
);
