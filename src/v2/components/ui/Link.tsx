import { Link as ReactRouterLink } from "react-router-dom";
import { styled } from "src/v2/stitches.config";

export const Link = styled(ReactRouterLink, {
  color: "#888888",
  variants: {
    centered: {
      true: {
        textAlign: "center",
      },
    },
  },
});
