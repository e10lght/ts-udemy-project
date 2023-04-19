import { Autobind as autobind } from "../decorators/autobind";
import { projectstate } from "../state/project-state";
// import { Validable, validate } from "../util/validation";
import * as Validation from "../util/validation";
import { Component } from "./base-component";

// フォーム表示と入力のクラス
export class ProjectInput extends Component<
  HTMLTemplateElement,
  HTMLFormElement
> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  mandayInputElement: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");
    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.mandayInputElement = this.element.querySelector(
      "#manday"
    ) as HTMLInputElement;

    this.configure();
  }

  configure() {
    console.log(this);
    this.element.addEventListener("submit", this.submitHandler);
  }

  renderContent(): void {}

  private gatherUserInput(): [string, string, number] | void {
    const enterdTittle = this.titleInputElement.value;
    const enterdDescription = this.descriptionInputElement.value;
    const enterdMondayInput = this.mandayInputElement.value;

    const validateTitle: Validation.Validable = {
      value: enterdTittle,
      required: true,
    };
    const validateDescription: Validation.Validable = {
      value: enterdDescription,
      required: true,
      maxLen: 10,
      minLen: 5,
    };
    const validateMonday: Validation.Validable = {
      value: enterdMondayInput,
      required: true,
      min: 10,
      max: 100,
    };

    if (
      !Validation.validate(validateTitle) ||
      !Validation.validate(validateDescription) ||
      !Validation.validate(validateMonday)
    ) {
      alert("正しく入力してください");
      return;
    }
    return [enterdTittle, enterdDescription, Number(enterdMondayInput)];
  }

  private clearInputs() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.mandayInputElement.value = "";
  }

  // 呼び出されたときの参照先をクラスにするためにここに付与する
  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      const [title, desc, manday] = userInput;
      projectstate.addProject(title, desc, manday);
      this.clearInputs();
    }
  }
}
