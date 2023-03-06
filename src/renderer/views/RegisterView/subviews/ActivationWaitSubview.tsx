import React, { useState } from "react";
import { useActivate } from "src/utils/useActivate";
import { useActivationStatus } from "src/utils/useActivationStatus";

function ActivationWaitSubview() {
  const activate = useActivate();
  const { activated, loading, error } = useActivationStatus();

  const [state, setState] = useState("");

  // useEffect(() => {
  //   (async () => {
  //     await activate();

  //     setState('Activation tx Staged, waiting for validation...');
  //   })();

  //   if (activated) {
  //     setState('Account Activated!');

  //     Router.push()
  //   }
  // });

  return <></>;
}

export default ActivationWaitSubview;
