import * as React from 'react';
import LobbyView from './LobbyView';
import LoginView from './LoginView';
import { observer, inject } from 'mobx-react';
import { IStoreContainer } from '../interfaces/store';


const MainView = observer(({ accountStore, routerStore }: IStoreContainer) => {

    return (
        <div>
            {
                accountStore.isLogin ?
                    <LobbyView accountStore={accountStore} routerStore={routerStore}/> :
                    <LoginView accountStore={accountStore} routerStore={routerStore}></LoginView>
            }
        </div>
    );
})

export default inject('accountStore', 'routerStore')(MainView)
