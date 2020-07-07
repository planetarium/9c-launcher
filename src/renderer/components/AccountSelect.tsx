import React from "react";
import AccountStore from "../stores/account";
import { MenuItem, Select, SelectProps } from "@material-ui/core";
import { observer } from "mobx-react";
import { SelectInputProps } from "@material-ui/core/Select/SelectInput";

interface IAccountSelectProps extends SelectProps {
  addresses: string[];
  selectedAddress: string;
  onChangeAddress: (address: string) => void;
}

export const AccountSelect: React.FC<IAccountSelectProps> = observer(
  (props: IAccountSelectProps) => {
    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
      props.onChangeAddress(event.target.value as string);
    };

    return (
      <Select
        {...props}
        id="account-select"
        variant="outlined"
        value={props.addresses}
        onChange={handleChange}
        fullWidth
      >
        {props.addresses.map((value) => (
          <MenuItem key={value} value={value}>
            {value}
          </MenuItem>
        ))}
      </Select>
    );
  }
);
