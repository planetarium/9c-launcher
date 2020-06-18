import * as React from 'react';

export interface ILayoutProps {
}

export const Layout: React.FunctionComponent<ILayoutProps> = ({ children }) => {

    return (
        <div className="layout">
            <div className="container">
                <div className="banner">

                </div>
                <div className="body">
                    {children}
                </div>
            </div>
        </div>
    );
}
