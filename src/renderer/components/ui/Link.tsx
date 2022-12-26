import { Link as ReactRouterLink } from "react-router-dom";
import { styled } from "src/renderer/stitches.config";

export const Link = styled(ReactRouterLink, {
  color: "#888888",
  cursor: "pointer",
  variants: {
    centered: {
      true: {
        textAlign: "center",
      },
    },
  },
});

export const ExtLink = styled("a", {
  color: "#888888",
  cursor: "pointer",
  variants: {
    centered: {
      true: {
        textAlign: "center",
      },
    },
  },
});
