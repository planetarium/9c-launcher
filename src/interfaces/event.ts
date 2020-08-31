import { FormEvent } from "react";

interface LoginFormElement extends HTMLFormElement {
  password: HTMLInputElement;
}

interface RootChainFormElement extends HTMLFormElement {
  rootchain: HTMLInputElement;
  chain: HTMLInputElement;
}

export interface LoginFormEvent extends React.FormEvent<LoginFormElement> {
  target: LoginFormElement;
}

export interface RootChainFormEvent extends React.FormEvent<LoginFormElement> {
  target: RootChainFormElement;
}
