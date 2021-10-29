import Decimal from "decimal.js";
import { action, computed, observable } from "mobx";
import { verify as addressVerify } from "eip55";

export enum TransferPhase {
  READY,
  SENDTX,
  SENDING,
  FINISHED,
}

export interface ITransferPageStore {
  recipient: string;
  memo: string;
  tx: string;
  amount: Decimal;
  success: boolean;
  recipientWarning: boolean;
  amountWarning: boolean;
  currentPhase: TransferPhase;
}

export default class TransferPageStore implements ITransferPageStore {
  @observable public recipient: string;
  @observable public memo: string;
  @observable public tx: string;
  @observable public amount: Decimal;
  @observable public success: boolean;
  @observable public recipientWarning: boolean;
  @observable public amountWarning: boolean;
  @observable public currentPhase: TransferPhase;

  constructor() {
    this.recipient = "";
    this.memo = "";
    this.tx = "";
    this.amount = new Decimal(0);
    this.success = false;
    this.recipientWarning = false;
    this.amountWarning = false;

    this.currentPhase = TransferPhase.READY;
  }

  @computed get validateRecipient() {
    return addressVerify(this.recipient, true);
  }

  @computed get validateAmount() {
    return this.amount.gt(0);
  }

  @computed get sendButtonActivated() {
    return this.validateRecipient && this.validateAmount;
  }

  @action
  public setRecipient(recipient: string) {
    this.recipient = recipient;
  }

  @action
  public setMemo(memo: string) {
    this.memo = memo;
  }

  @action
  public setAmount(amount: Decimal) {
    this.amount = amount;
  }

  @action
  public resetRecipientWarning() {
    this.recipientWarning = false;
  }

  @action
  public setRecipientWarning() {
    this.recipientWarning = !this.validateRecipient;
  }

  @action
  public resetAmountWarning() {
    this.amountWarning = false;
  }

  @action
  public setAmountWarning() {
    this.amountWarning = !this.validateAmount;
  }

  /*
    This state machine is a simple.
    startSend() -> setTx() -> endSend() -> finish()
    FIXME: this state machine do not have any error handling.
  */
  @action
  public startSend() {
    this.currentPhase = TransferPhase.SENDTX;
  }

  @action
  public setTx(tx: string) {
    this.tx = tx;
    this.currentPhase = TransferPhase.SENDING;
  }

  @action
  public endSend(success: boolean) {
    this.success = success;
    this.currentPhase = TransferPhase.FINISHED;
  }

  @action
  public finish() {
    this.currentPhase = TransferPhase.READY;
    this.success = false;
  }
}
