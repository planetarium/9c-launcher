import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import * as fs from "fs";

interface State {
    text: string;
}

export default class FooView extends React.Component<RouteComponentProps, State> {
    fileRef: React.RefObject<HTMLInputElement>;

    constructor(props: RouteComponentProps) {
        super(props);
        this.state = {
            text: "Open a file to display content here"
        };

        this.fileRef = React.createRef<HTMLInputElement>();
    }

    onGotoBarClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        console.log("Navigating to Bar view");
        this.props.history.push("/bar");
    };

    onOpenFileClick = () => {
        if (this.fileRef.current) {
            this.fileRef.current.click();
        }
    }

    onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let paths = e.currentTarget.files;

        if (!paths || paths.length < 1) {
            this.setState({ text: "Could not load files..." });
            return;
        }

        let filePath = paths[0].path;

        this.loadFileContent(filePath)
            .then((fileContent) => {
                this.setState({ text: fileContent });
            })
            .catch(err => {
                this.setState({ text: err.message });
            });
    }

    loadFileContent = (filePath: string): Promise<string> => {
        return new Promise<string>((res, rej) => {
            fs.readFile(filePath, { encoding: "utf8" }, (err, data) => {
                if (err) {
                    console.log(err);
                    res(err.message);
                }
                else {
                    var dataStr = data.toString();
                    console.log(dataStr);
                    res(dataStr);
                }
            });
        });
    }


    public render() {
        return (
            <div>
                <h3>FOO View</h3>
                <p>
                    {this.state.text}
                </p>

                <button onClick={this.onOpenFileClick}>Open file...</button>
                <input type="file" ref={this.fileRef} onChange={this.onFileInputChange} style={{ display: "none" }} />
                <button onClick={this.onGotoBarClick}>Go to Bar</button>
            </div>
        );
    }
}
