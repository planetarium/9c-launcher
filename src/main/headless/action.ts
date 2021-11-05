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
}
