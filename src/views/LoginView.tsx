import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { useState } from 'react';

interface State {
    text: string;
}

export default function LoginView(props: any) {
    const [address, setAddress] = useState('placeholder');
    const [passphrase, setPassphrase] = useState('placeholder');
    const [privateKey, setPrivateKey] = useState('username22');

    const handleAccount = () => {
        console.log(props)
        props.setAddress(address);
        props.setPrivateKey(privateKey);
        props.setLogin(true);
    }
    return (
        <div>
            <div className="login">
                <div className="container">
                    <div className="header">
                        <h3>Login</h3>
                    </div>
                    <form>
                        <label>Address</label> <input onChange={event => {setAddress(event.target.value); console.log(address)}} type="text"></input>
                        <br/>
                        <label>Passphrase</label> <input type="password" onChange={event => {setPassphrase(event.target.value)}}></input>
                    </form>
                    <button onClick={event => {handleAccount()}}>Login </button>
                </div>
            </div>
        </div>
    );
}
