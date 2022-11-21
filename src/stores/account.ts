import { observable, action } from "mobx";

export interface IAccountStore {
  addresses: string[];
  privateKey: string;
  selectedAddress: string;
  isLogin: boolean;
  activationKey: string;
}

export default class AccountStore implements IAccountStore {
  // Referenced mobxjs/mobx#669-comments
  // https://git.io/JJv8j
  public readonly addresses = observable<string>([]);

  @observable
  public privateKey: string = "";

  @observable
  public selectedAddress: string = "";

  @observable
  public isLogin: boolean = false;

  @observable
  public activationKey: string = "";

  @action
  setPrivateKey = (privateKey: string) => {
    this.privateKey = privateKey;
  };

  @action
  setSelectedAddress = (address: string) => {
    this.selectedAddress = address;
  };

  @action
  addAddress = (address: string) => {
    this.addresses.push(address);
  };

  @action
  removeAddress = (address: string) => {
    this.addresses.remove(address);
  };

  @action
  setAddresses = (addresses: string[]) => {
    this.addresses.replace(addresses);
  };

  @action
  setLoginStatus = (status: boolean) => {
    this.isLogin = status;
  };

  @action
  toggleLogin = () => {
    this.isLogin = !this.isLogin;
  };

  @action
  changeAddress = (index: number) => {
    if (index >= 0 && index < this.addresses.length) {
      this.selectedAddress = this.addresses[index];
    }
  };

  @action
  setActivationKey = (activationKey: string) => {
    this.activationKey = activationKey;
  };
}
