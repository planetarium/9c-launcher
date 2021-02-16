import isDev from "electron-is-dev";
import {
  Mixpanel as MixpanelBrowser,
  init as createMixpanelBrowser,
} from "mixpanel-browser";
import { electronStore } from "../config";

type JobFunc = () => void;
type MixpanelBrowserConstructor = (token: string) => MixpanelBrowser;

const TOKEN = "80a1e14b57d050536185c7459d45195a";
class LazyMixpanelBrowser {
  private readonly mixpanelBrowserFactory: MixpanelBrowserConstructor;
  private readonly jobQueue: JobFunc[];
  private mixpanelBrowser: MixpanelBrowser | undefined;

  constructor(mixpanelBrowserFactory: MixpanelBrowserConstructor) {
    this.mixpanelBrowserFactory = mixpanelBrowserFactory;
    this.jobQueue = [];
  }

  public init(distinct_id: string) {
    this.mixpanelBrowser = this.mixpanelBrowserFactory(TOKEN);
    this.mixpanelBrowser.register({
      distinct_id: distinct_id,
    });

    if (isDev || !electronStore.get("Mixpanel")) {
      this.mixpanelBrowser.disable();
    }

    while (this.jobQueue.length > 0) {
      const jobFunc = this.jobQueue.pop()!;
      jobFunc();
    }
  }

  public track(eventName: string) {
    if (this.mixpanelBrowser === undefined) {
      this.jobQueue.push(() => this.mixpanelBrowser?.track(eventName));
      return;
    }

    this.mixpanelBrowser.track(eventName);
  }

  public identify(uniqueId: string) {
    if (this.mixpanelBrowser === undefined) {
      this.jobQueue.push(() => this.mixpanelBrowser?.identify(uniqueId));
      return;
    }

    this.mixpanelBrowser.identify(uniqueId);
  }

  public alias(alias: string, original: string) {
    if (this.mixpanelBrowser === undefined) {
      this.jobQueue.push(() => this.mixpanelBrowser?.alias(alias, original));
      return;
    }

    this.mixpanelBrowser?.alias(alias, original);
  }

  public get_distinct_id(): string | undefined {
    return this.mixpanelBrowser?.get_distinct_id();
  }
}

// NOTE: mixpanel.init(token, options?, name?): Mixpanel 의 타입을 가졌지만 name이 undefined 이면 반환값이 undefined입니다. (mixpanel-browser 2.38.0 기준)
export const mixpanelBrowser = new LazyMixpanelBrowser((token) =>
  createMixpanelBrowser(token, {}, "browser")
);
