import Decimal from "decimal.js";
import { action, observable } from "mobx";

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
  currentPhase: TransferPhase;
}


export default class TransferPageStore implements ITransferPageStore {
  @observable public recipient: string;
  @observable public memo: string;
  @observable public tx: string;
  @observable public amount: Decimal;
  @observable public success: boolean;
  @observable public currentPhase: TransferPhase;

  constructor() {
    this.recipient = "";
    this.memo = "";
    this.tx = "";
    this.amount = new Decimal(-1);
    this.success = false;

    this.currentPhase = TransferPhase.READY;
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

  @action
  public validateRecipient(): boolean {
    return /^0x[0-9a-fA-F]{40}$/.test(this.recipient);
  }
}
