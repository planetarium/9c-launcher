import React from "react";
import {
  MenuItem,
  Select as OriginalSelect,
  SelectProps,
} from "@material-ui/core";
import { observer } from "mobx-react";

interface ISelectProps extends Omit<SelectProps, "onChange"> {
  items: string[];
  value?: string;
  onChange?: (item: string) => void;
}

export const Select: React.FC<ISelectProps> = observer(
  ({ items, value, onChange, ...props }) => {
    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
      onChange && onChange(event.target.value as string);
    };

    return (
      <OriginalSelect
        id="select"
        variant="outlined"
        value={value}
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
