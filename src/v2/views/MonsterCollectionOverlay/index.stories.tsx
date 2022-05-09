import React from "react";
import { MonsterCollectionContent } from ".";
import { MonsterCollectionOverlayBase } from "./base";

import "normalize.css";

export default {
  title: "MonsterCollection/MonsterCollectionContent",
  component: MonsterCollectionContent,
};

export const FirstPage = () => (
  <MonsterCollectionOverlayBase as="main">
    <MonsterCollectionContent />
  </MonsterCollectionOverlayBase>
);
