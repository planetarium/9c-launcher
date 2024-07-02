import React from "react";

type Props = {
  children?: JSX.Element[];
  page: number;
};

function Carousel({ children }: Props) {
  if (!children) return null;

  return <div>{...children}</div>;
}

export default Carousel;
