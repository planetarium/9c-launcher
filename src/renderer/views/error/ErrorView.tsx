import * as React from "react";
import { observer, inject } from "mobx-react";
import { IStoreContainer } from "../../../interfaces/store";
import { useProtectedPrivateKeysQuery } from "../../../generated/graphql";
import { Button } from "@material-ui/core";

const ErrorView: React.FC<{}> = () => {
  return (
    <div>
      <h1>Oops, something went wrong.</h1>
      <label>Please follow step below.</label>
      <ol>
        <li>Quit launcher.</li>
        <li>Reopen launcher.</li>
        <li>Clear Cache.</li>
        <li>Download Snapshot.</li>
        <li>Login.</li>
      </ol>
    </div>
  );
};

export default ErrorView;
