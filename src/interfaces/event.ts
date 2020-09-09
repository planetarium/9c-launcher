import { FormEvent } from "react";

interface LoginFormElement extends HTMLFormElement {
  password: HTMLInputElement;
}

interface SettingsFormElement extends HTMLFormElement {
  rootchain: HTMLInputElement;
  chain: HTMLInputElement;
  select: HTMLInputElement;
}

export interface LoginFormEvent extends FormEvent<LoginFormElement> {
  target: LoginFormElement;
}

export interface SettingsFormEvent extends FormEvent<LoginFormElement> {
  target: SettingsFormElement;
}
