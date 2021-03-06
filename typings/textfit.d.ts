interface TextFitOption {
  multiLine?: boolean; // if true, textFit will not set white-space: no-wrap
  maxFontSize?: number;
}

export default function textFit(
  element: HTMLElement,
  options: TextFitOption
): void;
