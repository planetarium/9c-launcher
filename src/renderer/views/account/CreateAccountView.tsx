import * as React from "react";
import { observer } from "mobx-react";
import { TextField } from "@material-ui/core";
import { ExecutionResult } from "react-apollo";
import { useState } from "react";
import { IStoreContainer } from "../../../interfaces/store";
import { useCreatePrivateKeyMutation } from "../../../generated/graphql";
import AccountStore from "../../stores/account";
import { RouterStore } from "mobx-react-router";

interface ICreateAccountProps {
  accountStore: AccountStore;
  routerStore: RouterStore;
}

const CreateAccountView: React.FC<ICreateAccountProps> = observer(
  ({ accountStore, routerStore }: ICreateAccountProps) => {
    const { push } = routerStore;
    const [createAccount, { data }] = useCreatePrivateKeyMutation();
    const [passphrase, setPassphrase] = useState("");

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setPassphrase(event.target.value);
    };

    return (
      <div>
        <form
          noValidate
          autoComplete="off"
          onSubmit={(e) => {
            e.preventDefault();
            console.log(data);
            createAccount({
              variables: {
                passphrase,
              },
            }).then((e: ExecutionResult<any>) => {
              console.log(e);
              const { address } = e.data.keyStore.createPrivateKey;
              accountStore.addAddress(address);
              push("/");
            });
          }}
        >
          <TextField
            id="standard-basic"
            label="passpaharase"
            onChange={handleChange}
          />
          <button disabled={passphrase === ""} type="submit">
            {" "}
            Create Account{" "}
          </button>
        </form>
        <br />
      </div>
    );
  }
);

export default CreateAccountView;
