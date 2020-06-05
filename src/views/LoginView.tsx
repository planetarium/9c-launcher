import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import * as fs from "fs";

interface State {
    text: string;
}

export default class LoginView extends React.Component<RouteComponentProps, State> {
    fileRef: React.RefObject<HTMLInputElement>;

    constructor(props: RouteComponentProps) {
        super(props);
        this.state = {
            text: "Open a file to display content here"
        };

        this.fileRef = React.createRef<HTMLInputElement>();
    }
    public render() {
        return (
            <div className="login">
                <div className="container">
                    <div className="header">
                        <h3>Login</h3>
                    </div>
                    <form>
                        <label>Address</label> <input type="text"></input>
                        <br/>
                        <label>Passphrase</label> <input type="password"></input>
                    </form>
                </div>
            </div>
        );
    }
}
