import * as React from "react";
import { useState } from "react";
import gql from "graphql-tag";
import { useQuery } from "react-apollo";
import { LOCAL_SERVER_URL, standaloneProperties } from "../../config";
import { IStoreContainer } from "../../interfaces/store";
import {
  FormControl,
  Select,
  MenuItem,
  LinearProgress,
} from "@material-ui/core";
import { observer } from "mobx-react";
import { useDecreyptedPrivateKeyLazyQuery } from "../../generated/graphql";
import Alert from "../components/Alert";
import Snackbar from "@material-ui/core/Snackbar";

const QUERY_CRYPTKEY = gql`
  query {
    keyStore {
      protectedPrivateKeys {
        address
      }
    }
  }
`;

const GET_DECRYPTKEY = gql`
  query decreyptedPrivateKey($address: Address, $passphrase: String) {
    keyStore {
      decryptedPrivateKey(address: $address, passphrase: $passphrase)
    }
  }
`;

interface ILoginComponentProps extends IStoreContainer {
  keyStore: IProtectedPrivateKey;
}

const LoginView = observer((props: IStoreContainer) => {
  const { loading, error, data } = useQuery(QUERY_CRYPTKEY);
  error != undefined ? console.log(error) : null;

  return (
    <div>
      <div className="login">
        <div className="container">
          <div className="header">
            <h3>Login</h3>
          </div>
          {loading || error != undefined ? (
            <WaitComponent error={error} loading={loading} />
          ) : (
            <LoginComponent {...props} keyStore={data.keyStore} />
          )}
        </div>
      </div>
    </div>
  );
});

function WaitComponent(props: any) {
  const errorHandler = (error: any) => {
    console.log(error);
    return <label>Something went wrong.</label>;
  };
  return (
    <div>
      {props.error != undefined ? (
        <label>{errorHandler(props.error)}</label>
      ) : (
        <label>Now Loading...</label>
      )}
    </div>
  );
}

const LoginComponent = observer((props: ILoginComponentProps) => {
  const [passphrase, setPassphrase] = useState("");
  const [openSnackbar, setSnackbarStatus] = useState(false);
  const { accountStore, routerStore, keyStore } = props;
  const [
    getDecreyptedKey,
    { loading, data },
  ] = useDecreyptedPrivateKeyLazyQuery();

  const addresses = keyStore.protectedPrivateKeys.map((value) => value.address);
  addresses.map((value) => {
    accountStore.addresses.includes(value)
      ? null
      : accountStore.addAddress(value);
  });

  const getPrivateKey = (): string | undefined => {
    getDecreyptedKey({
      variables: {
        address: accountStore.selectAddress,
        passphrase: passphrase,
      },
    });
    return data?.keyStore?.decryptedPrivateKey;
  };

  const handleAccount = () => {
    const privateKey = getPrivateKey();
    if (privateKey === undefined) {
      setSnackbarStatus(true);
      return;
    }

    accountStore.setPrivateKey(privateKey);
    accountStore.toggleLogin();

    const properties = {
      ...standaloneProperties,
      PrivateKeyString: privateKey,
    };
    console.log(properties);
    fetch(`http://${LOCAL_SERVER_URL}/initialize-standalone`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(properties),
    })
      .then((response) => response.text())
      .then((body) => console.log(body))
      .then((_) =>
        fetch(`http://${LOCAL_SERVER_URL}/run-standalone`, {
          method: "POST",
        })
      )
      .then((response) => response.text())
      .then((body) => console.log(body))
      .then((_) => {})
      .catch((error) => console.log(error));
  };

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    accountStore.setSelectedAddress(event.target.value as string);
  };

  const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackbarStatus(false);
  };

  // FIXME 키가 하나도 없을때 처리는 안해도 되지 않을지?
  if (!accountStore.selectAddress && accountStore.addresses.length > 0) {
    accountStore.setSelectedAddress(accountStore.addresses[0]);
  }

  return (
    <div>
      <form>
        <FormControl>
          <Select
            id="account-select"
            value={accountStore.selectAddress}
            onChange={handleChange}
            autoWidth
          >
            {accountStore.addresses.map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <br />
        <label>Passphrase</label>{" "}
        <input
          type="password"
          onChange={(event) => {
            setPassphrase(event.target.value);
          }}
          onKeyDown={(event) => {
            // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
            const enterKeyCode = 13;
            if (enterKeyCode === event.keyCode) {
              handleAccount();
            }
          }}
        ></input>
      </form>
      <button
        disabled={loading}
        onClick={(event) => {
          handleAccount();
        }}
      >
        Login{" "}
      </button>
      <br />
      <button onClick={() => routerStore.push("/account")}>
        {" "}
        Account Management{" "}
      </button>
      <br />
      <button onClick={() => routerStore.push("/config")}> Config </button>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="error">
          passphrase is wrong.
        </Alert>
      </Snackbar>
    </div>
  );
});

export default LoginView;
