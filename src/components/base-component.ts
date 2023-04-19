// コンポーネントを表示するベースとなるクラス
// 必ず継承させたいのでabstractとする
export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    temlateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string
  ) {
    this.templateElement = document.getElementById(
      temlateId
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId)! as T;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as U;

    if (newElementId) {
      this.element.id = newElementId;
    }

    this.attach(insertAtStart);
  }

  // 具体的な設定は継承先で行う
  abstract configure(): void;
  abstract renderContent(): void; // abstractではprivateは許可されない

  // 要素の取得や追加などの汎用的な処理はこのクラスで行う
  private attach(insertAtBegining: boolean) {
    if (insertAtBegining) {
      this.hostElement.insertAdjacentElement("afterbegin", this.element);
    } else {
      this.hostElement.insertAdjacentElement("beforeend", this.element);
    }
  }
}
