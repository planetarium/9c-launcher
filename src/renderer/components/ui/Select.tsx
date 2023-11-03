import {
  InputLabel,
  Select as MUISelect,
  FormControl,
  MenuItem,
} from "@mui/material";
import { styled } from "src/renderer/stitches.config";

export const SelectWrapper = styled(FormControl, {
  "& label": {
    fontFamily: "Montserrat, sans-serif",
    color: "white",
  },
  "& .MuiSelect-icon": {
    color: "white",
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: "2px",
    fontFamily: "Montserrat, sans-serif",
    color: "white",
    "& fieldset": {
      borderColor: "#AAA",
    },
    "&:hover fieldset": {
      borderColor: "white",
    },
    "&.Mui-focused fieldset": {
      borderColor: "white",
    },
  },
});

export const Select = styled(MUISelect, {
  position: "relative",
  textTransform: "capitalize",
  variants: {
    invalid: {
      true: {
        borderColor: "$invalid",
        color: "$invalid",
      },
    },
  },
});

export const Label = styled("label", {
  position: "relative",
  top: "80%",
});

export const SelectLabel = styled(InputLabel, {
  fontFamily: "Montserrat, sans-serif",
  color: "White",
});

export const SelectOption = styled(MenuItem, {
  textTransform: "capitalize",
});
