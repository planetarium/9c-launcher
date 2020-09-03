import React from "react";
import AccountStore from "../stores/account";
import {
  MenuItem,
  Select as OriginalSelect,
  SelectProps,
} from "@material-ui/core";
import { observer } from "mobx-react";
import { SelectInputProps } from "@material-ui/core/Select/SelectInput";

interface ISelectProps extends Omit<SelectProps, "onChange"> {
  items: string[];
  value?: string;
  onChange?: (item: string) => void;
}

export const Select: React.FC<ISelectProps> = observer(
  ({ items, value, onChange, ...props }: ISelectProps) => {
    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
      onChange && onChange(event.target.value as string);
    };

    return (
      <OriginalSelect
        id="select"
        variant="outlined"
        value={value}
        // @ts-ignore
        onChange={handleChange}
        fullWidth
        {...props}
      >
        {items.map((value) => (
          <MenuItem key={value} value={value}>
            {value}
          </MenuItem>
        ))}
      </OriginalSelect>
    );
  }
);
