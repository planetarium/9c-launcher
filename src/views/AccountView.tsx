import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { IStoreContainer } from '../interfaces/store';
import { Container, InputLabel } from '@material-ui/core';
import CreateAccountView from './CreateAccountView';
import RevokeAccountView from './RevokeAccountView';

const AccountView = observer(({ accountStore, routerStore }: IStoreContainer) => {
    return (
        <div>
            <Container>
                <InputLabel>Create Account</InputLabel>
                <CreateAccountView accountStore={accountStore} routerStore={routerStore} />
            </Container>
            <Container>
                <InputLabel>Revoke Address</InputLabel>
                <RevokeAccountView accountStore={accountStore} routerStore={routerStore} />
            </Container>
            <button onClick={() => { routerStore.push('/') }}>back to the home</button>
 
       </div>
    );
})

export default inject('accountStore', 'routerStore')(AccountView)
