import { observable, action } from "mobx";

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
