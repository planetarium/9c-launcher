import React from "react";
import {
  AlertBase,
  AlertButton,
  AlertButtonBar,
  AlertDescription,
  AlertHeader,
  AlertTitle,
} from "./dialog";

import infoIcon from "src/v2/resources/collection/mark-information.png";

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
