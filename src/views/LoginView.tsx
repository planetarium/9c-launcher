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

const GET_DECRYPTKEY = gql`
  query decreyptedPrivateKey($address: Address, $passphrase: String){
      keyStore {
            decryptedPrivateKey(
                address: $address,
                passphrase: $passphrase,
            )
        }
    }
`;

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
    //TODO: 플레이스홀더로 대체하고, 밑에서 input이 아니라 select로 바꿔서 여러 키 다 보여줄 수 있게 변경
    const [address, setAddress] = useState(props.keyStore.protectedPrivateKeys[0].address);
    const [passphrase, setPassphrase] = useState('placeholder');
    const { loading, error, data } = useQuery(GET_DECRYPTKEY, {
        variables: {
            address: address,
            passphrase: passphrase
        },
    })

    const handleAccount = () => {
        props.setAddress(address);
        props.setPrivateKey(data.keyStore.decryptPrivateKey);
        props.setLogin(true);
    }

    return (
        <div>
            <form>
                <label>Address</label> <input value={address} onChange={event => { setAddress(event.target.value); console.log(address) }} type="text"></input>
                <br />
                <label>Passphrase</label> <input type="password" onChange={event => { setPassphrase(event.target.value); }}></input>
            </form>
            <button disabled={data == undefined} onClick={event => { handleAccount() }}>Login </button>
        </div>
    )
}