import { StandaloneSubcommand } from "./subcommand";

export class Action extends StandaloneSubcommand {
  public ActivateAccount(
    invitationCode: string,
    nonce: string,
    path: string
  ): boolean {
    try {
      this.execSync("action", "activate-account", invitationCode, nonce, path);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  public MonsterCollect(level: number, path: string): boolean {
    try {
      this.execSync("action", "monster-collect", "--level", `${level}`, path);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  public ClaimMonsterCollectionReward(
    avatarAddress: string,
    path: string
  ): boolean {
    try {
      this.execSync(
        "action",
        "claim-monster-collection-reward",
        avatarAddress,
        path
      );
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  public TransferAsset(
    sender: string,
    recipient: string,
    amount: number,
    memo: string,
    path: string
  ): boolean {
    try {
      this.execSync(
        "action",
        "transfer-asset",
        sender,
        recipient,
        `${amount}`,
        path,
        memo
      );
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  public Stake(amount: number, path: string): boolean {
    try {
      this.execSync("action", "stake", `${amount}`, path);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  public ClaimStakeReward(avatarAddress: string, path: string): boolean {
    try {
      this.execSync("action", "claim-stake-reward", avatarAddress, path);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
