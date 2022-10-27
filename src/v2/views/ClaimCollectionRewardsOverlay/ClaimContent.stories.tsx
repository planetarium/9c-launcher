import ClaimContent from "./ClaimContent";

import "normalize.css";
import React from "react";

export default {
  title: "MonsterCollection/ClaimContent",
  component: ClaimContent,
};

export const Default = () => (
  <ClaimContent
    isOpen
    tip={0}
    data={{
      stateQuery: {
        agent: {
          avatarStates: [
            {
              address: "0x0000000000000000000000000000000000000000",
              name: "A",
              updatedAt: 0,
            },
            {
              address: "0x0000000000000000000000000000000000000001",
              name: "B",
              updatedAt: 0,
            },
          ],
        },
      },
    }}
    onConfirm={() => {}}
    onClose={() => {}}
  />
);
