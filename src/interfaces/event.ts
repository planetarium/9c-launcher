import { FormEvent } from "react";

interface FormElement extends HTMLFormElement {
  password: HTMLInputElement;
}

export interface LoginFormEvent extends React.FormEvent<FormElement> {
  target: FormElement;
}
