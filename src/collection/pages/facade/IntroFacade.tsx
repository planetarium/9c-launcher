import { ipcRenderer } from "electron";
import React, { useState } from "react";
import Landing from "../landing/landing";
import Main from "../main/main";

export type Props = {
  isFirst: boolean;
  onCreateFile: () => void;
  agentAddress: string;
};

const IntroFacade: React.FC<Props> = (props: Props) => {
  const { isFirst, onCreateFile, agentAddress } = props;
  const [isIntro, setIsIntro] = useState<boolean>(isFirst);
  const handleNextButton = () => {
    onCreateFile();
    setIsIntro(true);
  };
  if (isIntro) {
    ipcRenderer.send("reload app");
  }

  console.log(
    `IntroFacade: ${agentAddress} isFirst: ${isFirst} isIntro: ${isIntro}`
  );

  if (!isIntro) return <Landing handleNextButton={handleNextButton} />;
  else
    return <Main signer={agentAddress} addressLoading={agentAddress === ""} />;
};

export default IntroFacade;
