import * as React from "react";
import "../../styles/layout/layout.scss";

export interface ILayoutProps {}

export const Layout: React.FC<ILayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <div className="container">
        <div className="banner"></div>
        <div className="body">{children}</div>
      </div>
    </div>
  );
};
