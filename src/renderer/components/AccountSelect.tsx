import React from "react";
import AccountStore from "../stores/account";
import { MenuItem, Select } from "@material-ui/core";
import { observer } from "mobx-react";

interface IAccountSelectProps {
  accountStore: AccountStore;
}

export const AccountSelect: React.FC<IAccountSelectProps> = observer(
  ({ accountStore }) => {
    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
      accountStore.setSelectedAddress(event.target.value as string);
    };

    return (
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
    );
  }
);
