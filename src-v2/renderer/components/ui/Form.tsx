import { styled } from "src/renderer/stitches.config";

export default styled("form", {
  "& > * + *": { marginTop: 16 },
});
