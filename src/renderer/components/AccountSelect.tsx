import React from "react";
import AccountStore from "../stores/account";
import { MenuItem, Select } from "@material-ui/core";
import { observer } from "mobx-react";

interface IAccountSelectProps {
  addresses: string[];
  selectAddress: string;
  onChangeAddress: (address: string) => void;
}

export const AccountSelect: React.FC<IAccountSelectProps> = observer(
  ({ addresses, selectAddress: selectedAddress, onChangeAddress }) => {
    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
      onChangeAddress(event.target.value as string);
    };

    return (
      <Select
        id="account-select"
        value={selectedAddress}
        onChange={handleChange}
        autoWidth
      >
        {addresses.map((value) => (
          <MenuItem key={value} value={value}>
            {value}
          </MenuItem>
        ))}
      </Select>
    );
  }
);
