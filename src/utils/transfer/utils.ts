import { get as getConfig } from "src/config";

export const handleDetailView = (txId: string) => {
  const planet = getConfig("Planet", "0x000000000000");
  const network = getConfig("Network", "9c-main");
  if (process.versions["electron"]) {
    import("electron").then(({ shell }) => {
      if (planet === "0x000000000000")
        shell.openExternal(`https://9cscan.com/tx/${txId}`);
      else if (planet === "0x100000000000")
        shell.openExternal(`https://internal.9cscan.com/tx/${txId}`);
      else if (planet === "0x000000000001")
        shell.openExternal(`https://heimdall.9cscan.com/tx/${txId}`);
      else if (planet === "0x100000000001")
        shell.openExternal(`https://heimdall-internal.9cscan.com/tx/${txId}`);
      else if (planet === "0x000000000002")
        shell.openExternal(`https://idun.9cscan.com/tx/${txId}`);
      else if (planet === "0x100000000002")
        shell.openExternal(`https://idun-internal.9cscan.com/tx/${txId}`);
      else
        shell.openExternal(
          `https://explorer.libplanet.io/${network}/transaction/?${txId}`,
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
