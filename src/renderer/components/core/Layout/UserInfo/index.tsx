import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { styled } from "src/renderer/stitches.config";

import AccountBoxIcon from "@material-ui/icons/AccountBox";
import FileCopyIcon from "@material-ui/icons/FileCopy";

import goldIconUrl from "src/renderer/resources/ui-main-icon-gold.png";
import monsterIconUrl from "src/renderer/resources/monster.png";
import { clipboard } from "electron";
import { toast } from "react-hot-toast";
import { useT } from "@transifex/react";
import { useBalance } from "src/utils/useBalance";
import { useLoginSession } from "src/utils/useLoginSession";
import { ExportOverlay } from "./ExportOverlay";
import { useStore } from "src/utils/useStore";
import Decimal from "decimal.js";

const UserInfoStyled = styled(motion.ul, {
  position: "fixed",
  top: 30,
  left: 50,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: 0,
  margin: 0,
  dragable: false,
});

const UserInfoItem = styled(motion.li, {
  display: "flex",
  height: 27,
  alignItems: "center",
  padding: 5,
  borderRadius: 5,
  "& > * + *": {
    marginLeft: 5,
  },
  "&:hover": {
    backgroundColor: "$gray80",
  },
});

export default function UserInfo() {
  const { transfer } = useStore();
  const loginSession = useLoginSession();
  const gold = useBalance();

  useEffect(() => {
    transfer.balance = new Decimal(gold);
  }, [gold]);

  const copyAddress = useCallback(() => {
    if (loginSession) {
      clipboard.writeText(loginSession.address.toString());
      toast("Copied!");
    }
  }, [loginSession]);

  const t = useT();

  const [isExportKeyOpen, setExportKeyOpen] = useState<boolean>(false);

  if (!loginSession) return null;

  return (
    <UserInfoStyled>
      <UserInfoItem
        onClick={() => {
          copyAddress();
          setExportKeyOpen(true);
        }}
      >
        <AccountBoxIcon />
        <strong>{loginSession.address.toString()}</strong>
        <FileCopyIcon />
      </UserInfoItem>
      <UserInfoItem>
        <img src={goldIconUrl} alt="gold" />
        <strong>{Number(gold)}</strong>
      </UserInfoItem>
      <ExportOverlay
        isOpen={isExportKeyOpen}
        onClose={() => setExportKeyOpen(false)}
      />
    </UserInfoStyled>
  );
}
