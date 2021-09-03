import React from "react";
import { observer } from "mobx-react";
import { motion } from "framer-motion";

function SettingsOverlay() {
  return (
    <motion.div
      initial={{ translateY: 150 }}
      animate={{ translateY: 0 }}
      style={{ backgroundColor: "white", width: 512, height: 512 }}
    />
  );
}

export default observer(SettingsOverlay);
