import { motion } from "framer-motion";
import React from "react";
import { get } from "src/config";
import { shell } from "electron";
import { T } from "src/renderer/i18n";
import { styled } from "src/renderer/stitches.config";

const Button = styled(motion.button, {
  appearance: "none",
  backgroundColor: "$primary",
  color: "white",
  border: "none",
  padding: "5px 1rem",
  "&:disabled": {
    backgroundColor: "$gray",
    color: "white",
  },
});

const transifexTags = "v2/GetPatronButton";

export function GetPatronButton() {
  return (
    <Button onClick={() => shell.openExternal(get("ActivationCodeUrl"))}>
      <T _str="Get Patron" _tags={transifexTags} />
    </Button>
  );
}
