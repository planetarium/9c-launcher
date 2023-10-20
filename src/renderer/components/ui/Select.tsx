import { Listbox, ListboxOption } from "@reach/listbox";
import "@reach/listbox/styles.css";
import { globalCss, styled } from "src/renderer/stitches.config";

globalCss({
  "div[data-reach-listbox-popover]": {
    backgroundColor: "$gray",
  },
  "[data-reach-listbox-list]": {
    maxHeight: "8rem",
    overflowY: "scroll",
  },
})();

export const Select = styled(Listbox, {
  position: "relative",
  outline: "none",
  border: "1px solid #979797",
  borderRadius: 2,
  display: "flex",
  flexDirection: "column",
  color: "White",
  height: "3rem",
  padding: "0 1rem",
  textTransform: "capitalize",
  variants: {
    invalid: {
      true: {
        borderColor: "$invalid",
        color: "$invalid",
      },
    },
  },
  "& [data-reach-listbox-button]": {
    border: "none",
    flex: 1,
    padding: 0,
  },
});

export const Label = styled("label", {
  position: "relative",
  top: "80%",
});

export const SelectOption = styled(ListboxOption, {
  textTransform: "capitalize",
});
