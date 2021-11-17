declare module "electron-ipc-log" {
  export interface Event {
    channel: string;
    data: any;
    sent?: boolean;
    sync?: boolean;
  }
  export default function (cb: (event: Event) => void): void;
}
