import { ipcRenderer } from "electron";
import { observable, action, decorate } from "mobx";
import headlessGraphQLSDK, { GraphQLSDK } from "../../middleware/graphql";

export enum MenuItems {
  TRANSFER,
  SWAP,
}

export interface IMenuStore {
  currentMenu: MenuItems;
}

export default class MenuStore implements IMenuStore {
  @observable
  public currentMenu: MenuItems = MenuItems.TRANSFER;

  @action
  changeMenu(menu: MenuItems) {
    this.currentMenu = menu;
  }
}
