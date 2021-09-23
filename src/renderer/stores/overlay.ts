import { observable, action, computed } from "mobx";

export type Page = "settings" | "staking" | "onboarding";

export default class OverlayStore {
  @observable
  page: null | Page = null;

  @computed
  get isOpen() {
    return this.page !== null;
  }

  @action
  close() {
    this.page = null;
  }

  @action
  open(page: Page) {
    this.page = page;
  }
}
