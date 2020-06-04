import * as React from 'react';
import { Link } from 'react-router-dom';

export interface ILayoutProps {
}

export const Layout: React.FunctionComponent<ILayoutProps> = ({ children }) => {

    const getTime = () => {
        let now = new Date();
        let year = now.getFullYear().toString();
        let month = now.getMonth().toString().padStart(2, "0");
        let day = now.getDate().toString().padStart(2, "0");
        return [year, month, day].reduce((prev, curr) => prev + "-" + curr);
    }

    return (
        <div className="layout">
            <div className="container">
                <div className="sidebar">
                    <Link to="/">Foo</Link>
                    <Link to="/bar">Bar</Link>
                </div>
                <div className="header">
                    <h1>My Application</h1>
                </div>
                <div className="body">
                    {children}
                </div>
                <div className="footer">
                    <p>Today is: {getTime()}</p>
                </div>
            </div>
        </div>
    );
}
