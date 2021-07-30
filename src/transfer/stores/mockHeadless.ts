import { observable } from "mobx";
import { IHeadlessStore } from "./headless";

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default class MockedHeadlessStore implements IHeadlessStore {
    @observable public balance: number = 1000;
    private agentAddress = "0x1234567890123456789012345678901234567890";

    assertAgentAddress = () => {
        return;
    };

    getBalance = async (): Promise<number> => {
        return this.balance;
    };

    getAgentAddress = (): string => {
        return this.agentAddress;
    };

    trySetAgentAddress = async (): Promise<boolean> => {
        return true;
    };

    transferGold = async (recipient: string, amount: number, memo: string): Promise<string> => {
        return "transferGold";
    };

    swapToWNCG = async (recipient: string, amount: number): Promise<string> => {
        return "swap ncg";
    };

    confirmTransaction = async (
        txId: string,
        timeout: number | undefined,
        onSuccess: (blockIndex: number, blockHash: string) => void,
        onFailure: (blockIndex: number, blockHash: string) => void,
        onTimeout: (blockIndex: number, blockHash: string) => void): Promise<void> => {
            await sleep(5000);
            switch (txId) {
                case "transferGold":
                    onSuccess(1, "blockHash");
                    break;
                case "swap ncg":
                    onSuccess(2, "blockHash");
                    break;
                case "timeout":
                    onTimeout(3, "blockHash");
                default:
                    onFailure(4, "blockHash");
            }
    };

    updateBalance = async (): Promise<number> => {
        this.balance = this.balance + 100;
        return this.balance;
    };

}