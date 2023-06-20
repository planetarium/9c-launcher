import { get as getConfig } from "src/config";

export const handleDetailView = (tx: string) => {
  const network = getConfig("Network", "main");
  if (process.versions["electron"]) {
    import("electron").then(({ shell }) => {
      if (network === "main") shell.openExternal(`https://9cscan.com/tx/${tx}`);
      else
        shell.openExternal(
          `https://explorer.libplanet.io/${network}/transaction/?${tx}`
        );
    });
  }
};

export enum TransferPhase {
  READY,
  SENDTX,
  SENDING,
  FINISHED,
}
