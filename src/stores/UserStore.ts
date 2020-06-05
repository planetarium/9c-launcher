import { observable, action } from 'mobx';

export default class UserStore {
  @observable public addresses: Array<string> = [];
  @observable public selectAddress: string = '';
  @observable public isLogin: boolean = false;
  
  @action
  login = (passphrase: string) => {
      // apollo graphql login request with selectAddress, passphrase
      
  }

  @action
  changeAddress = (index: number) => {
      if(index >= 0 && index < this.addresses.length) {
          this.selectAddress = this.addresses[index];
      }
  }

}