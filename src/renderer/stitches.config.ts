import { createStitches } from "@stitches/react";
import type * as Stitches from "@stitches/react";

export const {
  styled,
  css,
  globalCss,
  keyframes,
  getCssText,
  theme,
  createTheme,
  config,
} = createStitches({
  theme: {
    colors: {
      gray: "#1d1e1f",
      gray95: "#1d1e1ff2",
      gray80: "#1d1e1f80",
      accent: "#74f4bc",
      primary: "#3e2a8d",
      invalid: "#f66",
    },
    shadows: {
      text: "0px 2px 3px rgba(0, 0, 0, 0.5)",
    },
    fontWeights: {
      light: 300,
      regular: 400,
      bold: 700,
    },
  },
  utils: {
    dragable: (v: boolean) => ({
      "-webkit-app-region": v ? "drag" : "no-drag",
    }),
  },
});

export type CSS = Stitches.CSS<typeof config>;
