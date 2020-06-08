import * as React from 'react';
import { useState } from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';

const QUERY_CRYPTKEY = gql`
    query {
        keyStore {
            protectedPrivateKeys {
                address
            }
        }
    }
`

export default function LoginView(props: any) {
    const { loading, error, data } = useQuery(QUERY_CRYPTKEY)
    error != undefined ? console.log(error) : null

    return (
        <div>
            <div className="login">
                <div className="container">
                    <div className="header">
                        <h3>Login</h3>
                    </div>
                    {
                        loading || error != undefined ?
                            <WaitComponent 
                                error={error}
                                loading={loading}
                            /> :
                            <LoginComponent
                                {...props}
                                keyStore={data.keyStore}
                                error={error}
                            />
                    }
                </div>
            </div>
        </div>
    );
}

function WaitComponent(props: any) {
    const errorHandler = (error: any) => {
        console.log(error);
        return (
            <label>An Error Accupied.</label>
        )
    }
    return (
        <div>
            {
                props.error != undefined ?
                    <label>{errorHandler(props.error)}</label> :
                    <label>Now Loading...</label>
            }
            <label></label>
        </div>
    )
}

function LoginComponent(props: any) {
    const [address, setAddress] = useState(props.keyStore.protectedPrivateKeys[0].address);
    const [passphrase, setPassphrase] = useState('placeholder');
    const [privateKey, setPrivateKey] = useState('username22');

    console.log(props.error)

    const handleAccount = () => {
        props.setAddress(address);
        props.setPrivateKey(privateKey);
        props.setLogin(true);
    }

    return (
        <div>
            <form>
                <label>Address</label> <input value={address} onChange={event => { setAddress(event.target.value); console.log(address) }} type="text"></input>
                <br />
                <label>Passphrase</label> <input type="password" onChange={event => { setPassphrase(event.target.value) }}></input>
            </form>
            <button onClick={event => { handleAccount() }}>Login </button>
        </div>
    )
}