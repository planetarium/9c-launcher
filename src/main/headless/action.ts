import { StandaloneSubcommand } from "./subcommand";

export class Action extends StandaloneSubcommand {
    public ActivateAccount(invitationCode: string, nonce: string, path: string): boolean {
        try {
            this.execSync("action", invitationCode, nonce, path);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}
