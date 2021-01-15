import { observer } from "mobx-react";
import React, { useState } from "react";

import LinearProgressWithMessage from "../../components/LinearProgressWithMessage";
import UserMenu from "../../components/UserMenu";
import "../../styles/layout/layout2.scss"

const Layout2: React.FC = observer(({children}) => {
  const [awsSinkCloudwatchGuid, setAwsSinkCloudwatchGuid] = useState<string>("empty");

  return (
  <>
    <main>
      <div className="background" />
      <div className="clientId">Client ID: {awsSinkCloudwatchGuid}</div>
      <div className="children">{children}</div>
      <div className="debugInfo">
        <p>v100022. 6ec8E598962F1f475504F82fD5bF3410eAE58B9B</p>
        <p>ClientID. f94f38da-2410-41e4-9289-2e00fd0048de</p>
      </div>
      <LinearProgressWithMessage message="Executing Actions.. (8/8) 37% 1130" variant="determinate" value={50}/>
      <UserMenu />
    </main>
  </>
  );
});

export default Layout2;
