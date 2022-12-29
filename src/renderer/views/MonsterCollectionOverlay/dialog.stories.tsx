import React, { ComponentPropsWithoutRef } from "react";
import {
  AlertBase,
  AlertButton,
  AlertButtonBar,
  AlertDescription,
  AlertHeader,
  AlertTitle,
  MigrationAlert,
  MigrationAlertItem,
} from "./dialog";

import infoIcon from "src/renderer/resources/collection/mark-information.png";
import ncgIcon from "src/renderer/resources/collection/items/ncg.png";
import { T } from "@transifex/react";
import { noop } from "lodash";

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

export const Migration = ({
  isClaimable,
}: Pick<ComponentPropsWithoutRef<typeof MigrationAlert>, "isClaimable">) => (
  <MigrationAlert
    isOpen={true}
    onConfirm={noop}
    isClaimable={isClaimable}
    items={
      <>
        {" "}
        <MigrationAlertItem title="Deposit amount">
          <strong>
            <img src={ncgIcon} />
            500
          </strong>
        </MigrationAlertItem>
        <MigrationAlertItem title="Duration of progress">
          <span>
            <strong>365</strong> days <br />
            123456789 blocks
          </span>
        </MigrationAlertItem>
      </>
    }
  >
    <p>
      Monster collection has been improved to be more convenient and softer.
      Receive the previously accumulated rewards and return them to the same
      form as before. Moving on to the new monster collection?
    </p>
  </MigrationAlert>
);
Migration.args = {
  isClaimable: true,
};
