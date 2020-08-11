import { FormEvent } from "react";

interface FormElement extends HTMLFormElement {
  password: HTMLInputElement;
}

export interface LoginFormEvent extends React.FormEvent {
  target: FormElement;
}
