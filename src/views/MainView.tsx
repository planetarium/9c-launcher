import * as React from 'react';
import { useState } from 'react';
import LobbyView from './LobbyView';
import LoginView from './LoginView';


export default function MainView() {
    const [isLogin, setLogin] = useState(false);
    const [address, setAddress] = useState("placeholder");
    const [privateKey, setPrivateKey] = useState("placeholder");

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