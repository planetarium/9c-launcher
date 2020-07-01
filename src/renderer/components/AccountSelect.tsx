import React from "react";
import AccountStore from "../stores/account";
import { MenuItem, Select } from "@material-ui/core";
import { observer } from "mobx-react";

interface IAccountSelectProps {
  addresses: string[];
  selectedAddress: string;
  onChangeAddress: (address: string) => void;
}

export const AccountSelect: React.FC<IAccountSelectProps> = observer(
  ({ addresses, selectedAddress, onChangeAddress }) => {
    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
      onChangeAddress(event.target.value as string);
    };

    return (
      <Select
        id="account-select"
        value={selectedAddress}
        onChange={handleChange}
        fullWidth
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
