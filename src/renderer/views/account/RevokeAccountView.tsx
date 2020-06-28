import * as React from "react";
import { observer } from "mobx-react";
import { IStoreContainer } from "../../../interfaces/store";
import { Button } from "@material-ui/core";
import AccountStore from "../../stores/account";
import { RouterStore } from "mobx-react-router";
import { AccountSelect } from "../../components/AccountSelect";
import { useRevokePrivateKeyMutation } from "../../../generated/graphql";

interface IRevokeAccountProps {
  accountStore: AccountStore;
  routerStore: RouterStore;
}

const RevokeAccountView: React.FC<IRevokeAccountProps> = observer(
  ({ accountStore, routerStore }: IRevokeAccountProps) => {
    const [revokePrivateKey] = useRevokePrivateKeyMutation();
    return (
      <>
        <AccountSelect accountStore={accountStore} />
        <Button
          onClick={(event) => {
            event.preventDefault();
            revokePrivateKey({
              variables: {
                address: accountStore.selectAddress,
              },
            }).then((executionResult) => {
              const revokedAddress =
                executionResult.data?.keyStore?.revokePrivateKey?.address;
              if (undefined !== revokedAddress) {
                accountStore.removeAddress(revokedAddress);
                if (accountStore.addresses.length > 0) {
                  accountStore.setSelectedAddress(accountStore.addresses[0]);
                }
              }
            });
          }}
        >
          Revoke Key
        </Button>
      </>
    );
  }
);

export default RevokeAccountView;
