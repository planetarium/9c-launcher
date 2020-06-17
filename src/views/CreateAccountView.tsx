import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { IStoreContainer } from '../interfaces/store';


const CreateAccountView = observer(({ accountStore, routerStore }: IStoreContainer) => {
    const { push } = routerStore;
    return (
        <div>
            {
                <button onClick={() => {push('/')}}>back to the home</button>
            }
        </div>
    );
})

export default inject('accountStore', 'routerStore')(CreateAccountView)

