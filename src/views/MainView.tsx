import * as React from 'react';
import { useState } from 'react';
import LobbyView from './LobbyView';
import LoginView from './LoginView';

const { ipcRenderer } = window

export default function MainView() {
    const [isLogin, setLogin] = useState(false);
    const [address, setAddress] = useState("placeholder");
    const [privateKey, setPrivateKey] = useState("placeholder");

    ipcRenderer.on("error popup", (event, message) => {
        console.log(message);
    })

    return (
        <div>
            {
                isLogin ?
                    <LobbyView address={address} privateKey={privateKey} ></LobbyView> :
                    <LoginView setAddress={setAddress} setPrivateKey={setPrivateKey} setLogin={setLogin}></LoginView>
            }
        </div>
    );
}