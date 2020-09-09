import React from "react";
import {
  MenuItem,
  Select as OriginalSelect,
  SelectProps,
} from "@material-ui/core";

interface ISelectProps extends Omit<SelectProps, "onChange"> {
  items: string[];
  value?: string;
  onChange?: (item: string) => void;
}

const Select: React.FC<ISelectProps> = ({
  items,
  value,
  onChange,
  ...props
}) => {
  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    if (onChange !== undefined) onChange(event.target.value as string);
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
};

export default Select;
