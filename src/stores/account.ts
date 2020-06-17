import { observable, action, decorate } from 'mobx';

export interface IAccountStore {
  addresses: string[],
  privateKey: string,
  selectAddress: string,
  isLogin: boolean,
}

export default class AccountStore implements IAccountStore{
  @observable
  public addresses: string[] = [];

  @observable
  public privateKey: string = '';

  @observable
  public selectAddress: string = '';

  @observable
  public isLogin: boolean = false;

  @action
  setPrivateKey = (privateKey: string) => {
    this.privateKey = privateKey;
  }

  @action
  setSelectedAddress = (address: string) => {
    this.selectAddress = address;
  }

  @action
  addAddress = (address: string) => {
    this.addresses.push(address);
  }

  @action
  setAddresses = (addresses: string[]) => {
    this.addresses = addresses;
  }

  @action
  setLoginStatus = (status: boolean) => {
    this.isLogin = status;
  }

  @action
  toggleLogin = () => {
    this.isLogin = !this.isLogin;
  }

  @action
  changeAddress = (index: number) => {
      if(index >= 0 && index < this.addresses.length) {
          this.selectAddress = this.addresses[index];
      }
  }
}
