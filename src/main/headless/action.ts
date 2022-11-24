import { StandaloneSubcommand } from "./subcommand";
import { encode } from "bencodex";
import { writeFileSync } from "fs";

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
    console.log(sender, recipient, amount, memo, path);
    try {
      const encoded = encode([
        "TransferAsset",
        {
          recipient: Buffer.from(recipient.replace("0x", ""), "hex"),
          sender: Buffer.from(sender.replace("0x", ""), "hex"),
          amount: [
            {
              decimalPlaces: Buffer.from([0x02]),
              minters: [
                Buffer.from("2c2a05e29e8f57c4661fb8fff5e0c7a7e0f3c4fc", "hex"),
              ],
              ticker: "NCG",
            },
            Math.floor(amount * 100),
          ],
          ...(memo == null ? {} : { memo: memo }),
        },
      ]);

      writeFileSync(path, encoded.toString("base64"));
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  public Stake(amount: string, path: string): boolean {
    try {
      this.execSync("action", "stake", "--amount", amount, path);
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

  public MigrateMonsterCollection(
    avatarAddress: string,
    path: string
  ): boolean {
    try {
      this.execSync(
        "action",
        "migrate-monster-collection",
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
