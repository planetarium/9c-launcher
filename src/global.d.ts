declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.ttf" {
  const value: string;
  export default value;
}

declare module "*.module.scss" {
  const content: { [className: string]: string };
  export default content;
}

declare const GIT_HASH: string;
