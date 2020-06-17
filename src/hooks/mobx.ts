import React from 'react';
import { MobXProviderContext } from 'mobx-react';

function useStores() {
  return React.useContext(MobXProviderContext);
}

export default useStores;