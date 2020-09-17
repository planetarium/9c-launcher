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
}

interface RegisterPrivateKeyElement extends LoginFormElement {
  passwordConfirm: HTMLInputElement;
}

export interface LoginFormEvent extends FormEvent<LoginFormElement> {
  target: LoginFormElement;
}

export interface SettingsFormEvent extends FormEvent<SettingsFormElement> {
  target: SettingsFormElement;
}

export interface RegisterPrivateKeyEvent
  extends FormEvent<RegisterPrivateKeyElement> {
  target: RegisterPrivateKeyElement;
}
