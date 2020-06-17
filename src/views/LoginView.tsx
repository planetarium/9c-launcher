import * as React from 'react';
import { useState } from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';
import { GRAPHQL_SERVER_URL, standaloneProperties } from '../constant';
import { IStoreContainer } from '../interfaces/store';

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

interface ILoginComponentProps extends IStoreContainer {
    keyStore: IProtectedPrivateKey,
}

function LoginView(props: IStoreContainer) {
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

function LoginComponent(props: ILoginComponentProps) {
    //TODO: 플레이스홀더로 대체하고, 밑에서 input이 아니라 select로 바꿔서 여러 키 다 보여줄 수 있게 변경
    const [passphrase, setPassphrase] = useState('placeholder');
    const { accountStore, routerStore } = props
    const { loading, error, data } = useQuery(GET_DECRYPTKEY, {
        variables: {
            address: accountStore.selectAddress,
            passphrase: passphrase
        },
    });

    const handleAccount = () => {
        accountStore.setPrivateKey(data.keyStore.decryptedPrivateKey);
        accountStore.toggleLogin();
        const properties = {
            ...standaloneProperties,
            PrivateKeyString: data.keyStore.decryptedPrivateKey
        }
        console.log(properties);
        fetch(`${GRAPHQL_SERVER_URL}/run-standalone`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(properties)
        })
        .then((response) => {
            console.log(response)
        });
    }

    return (
        <div>
            <form>
                <label>Address</label> <input onChange={event => { accountStore.setAddress(event.target.value) }} type="text"></input>
                <br />
                <label>Passphrase</label> <input type="password" onChange={event => { setPassphrase(event.target.value); }}></input>
            </form>
            <button disabled={data == undefined} onClick={event => { handleAccount() }}>Login </button>
            <br />
            <button onClick={() => routerStore.push('/create')} > Create Account </button>
        </div>
    )
}

export default LoginView
