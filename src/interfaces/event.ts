import { FormEvent } from "react";

interface LoginFormElement extends HTMLFormElement {
  password: HTMLInputElement;
}

interface SettingsFormElement extends HTMLFormElement {
  rootchain: HTMLInputElement;
  chain: HTMLInputElement;
  select: HTMLInputElement;
}

export interface LoginFormEvent extends React.FormEvent<LoginFormElement> {
  target: LoginFormElement;
}

export interface SettingsFormEvent extends React.FormEvent<LoginFormElement> {
  target: SettingsFormElement;
}
