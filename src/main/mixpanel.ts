import { v4 as ipv4 } from "public-ip";
import { Mixpanel } from "mixpanel";

export interface INineChroniclesMixpanel {
  track(eventName: string, properties?: object, callback?: () => void): void;
  alias(alias: string): void;
  login(): void;
}

export class NineChroniclesMixpanel implements INineChroniclesMixpanel {
  private readonly _mixpanel: Mixpanel;
  private readonly _mixpanelUuid: string;
  // _ip must not be changed. It should be treated like an immutable variable.
  private _ip: string;
  private _login: boolean = false;

  constructor(mixpanel: Mixpanel, mixpanelUuid: string) {
    this._mixpanel = mixpanel;
    this._mixpanelUuid = mixpanelUuid;
    this._ip = "unknown";
    ipv4().then((value) => (this._ip = value));
  }

  public track(
    event: string,
    properties?: object,
    callback?: () => void,
  ): void {
    this._mixpanel.track(
      event,
      {
        distinct_id: this._mixpanelUuid,
        ip: this._ip,
        login: this._login,
        ...properties,
      },
      callback,
    );
  }

  public alias(alias: string): void {
    this._mixpanel.alias(this._mixpanelUuid, alias);
  }

  public login(): void {
    this._login = true;
  }
}
