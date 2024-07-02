import { FormEvent } from "react";

interface LoginFormElement extends HTMLFormElement {
  password: HTMLInputElement;
}

interface SettingsFormElement extends HTMLFormElement {
  rootchain: HTMLInputElement;
  chain: HTMLInputElement;
  select: HTMLInputElement;
  analytic: HTMLInputElement;
  sentry: HTMLInputElement;
  logsize: HTMLInputElement;
}

export interface LoginFormEvent extends FormEvent<LoginFormElement> {
  target: LoginFormElement;
}

export interface SettingsFormEvent extends FormEvent<SettingsFormElement> {
  target: SettingsFormElement;
}
