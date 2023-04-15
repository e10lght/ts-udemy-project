// drag&drop
interface Draggable {
  dragStartHandkler(event: DragEvent): void;
  dragEndHandkler(event: DragEvent): void;
}
interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

// project type
enum PrijectStatus {
  Active,
  Finished,
}

// Project Type
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public manday: number,
    public status: PrijectStatus
  ) {}
}

type Listener<T> = (items: T[]) => void;

class State<T> {
  // listenerは配列である意味があるか？➾配列なくても動作する。じゃあなんのために？
  // 配列を使用しない場合、addEventListenerなどのメソッドでリスナーを追加する際に、
  // 関数を毎回上書きする必要があるため、保守性が低下してしまう。
  protected listener: Listener<T>[] = [];

  addListener(listener: Listener<T>) {
    console.log(listener);
    // 配列としてpushする必要ある？
    this.listener.push(listener);
  }
}

// プロジェクトの状態を管理するクラス
class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  // シングルトンで状態管理オブジェクトは１つのみとする
  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  public addProject(title: string, description: string, manday: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      manday,
      PrijectStatus.Active
    );
    this.projects.push(newProject);
    this.updateListeners();
  }

  moveProject(projectId: string, newStatus: PrijectStatus) {
    const project = this.projects.find((prj) => prj.id === projectId);
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }

  private updateListeners() {
    for (const listenerFn of this.listener) {
      listenerFn(this.projects.slice()); // 変更されないためにコピーを渡す？
    }
  }
}

const projectstate = ProjectState.getInstance();

type Validable = {
  value: string | number;
  required?: boolean;
  maxLen?: number;
  minLen?: number;
  min?: number;
  max?: number;
};

function validate(validateInput: Validable) {
  let isValid = true;

  if (validateInput.required) {
    isValid = isValid && validateInput.value.toString().trim().length !== 0;
  }
  if (validateInput.maxLen && typeof validateInput.value === "string") {
    isValid = isValid && validateInput.maxLen >= validateInput.value.length;
  }
  if (validateInput.minLen && typeof validateInput.value === "string") {
    isValid = isValid && validateInput.minLen <= validateInput.value.length;
  }
  if (validateInput.min && typeof validateInput.value === "number") {
    isValid = isValid && validateInput.min <= validateInput.value;
  }
  if (validateInput.max && typeof validateInput.value === "number") {
    isValid = isValid && validateInput.max >= validateInput.value;
  }

  return isValid;
}

// bindを自動的に付与するデコレータ
function Autobind(
  _target: any,
  _propatyname: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: false,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}

// コンポーネントを表示するベースとなるクラス
// 必ず継承させたいのでabstractとする
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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

// それぞれのプロジェクトのリストアイテムを要素として追加するクラス
class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  private project: Project;

  get manday() {
    if (this.project.manday < 20) {
      return this.project.manday.toString() + "人日";
    } else {
      return (this.project.manday / 20).toString() + "人月";
    }
  }

  constructor(hostid: string, project: Project) {
    super("single-project", hostid, false, project.id);
    this.project = project;
    this.configure();
    this.renderContent();
  }

  @Autobind
  dragStartHandkler(event: DragEvent) {
    event.dataTransfer!.setData("text/plane", this.project.id);
    event.dataTransfer!.effectAllowed = "move";
  }
  dragEndHandkler(_: DragEvent) {
    console.log("drag終了");
  }

  configure() {
    this.element.addEventListener("dragstart", this.dragStartHandkler);
    this.element.addEventListener("dragend", this.dragEndHandkler);
  }
  renderContent() {
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector("h3")!.textContent = this.manday;
    this.element.querySelector("p")!.textContent = this.project.description;
  }
}

// プロジェクトのリストを表示するクラス
class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  // templateElement: HTMLTemplateElement;
  // hostElement: HTMLDivElement;
  // element: HTMLElement;
  assignedProjects: Project[];

  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  @Autobind
  dragOverHandler(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plane") {
      event.preventDefault(); // ドラッグ＆ドロップだけ動作する
      const listEl = this.element.querySelector("ul")!;
      listEl.classList.add("droppable");
    }
  }

  @Autobind
  dropHandler(event: DragEvent) {
    const prjId = event.dataTransfer!.getData("text/plane");
    projectstate.moveProject(
      prjId,
      this.type === "active" ? PrijectStatus.Active : PrijectStatus.Finished
    );
  }

  @Autobind
  dragLeaveHandler(_: DragEvent) {
    const listEl = this.element.querySelector("ul")!;
    listEl.classList.remove("droppable");
  }

  // 一般的にpublicはprivateの上に定義される
  configure() {
    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("drop", this.dropHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHandler);
    // これなに？いつどこで実行される？
    // これははじめに実行されて格納される。内部の関数は状態管理クラス内部で実行される
    projectstate.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((prj) => {
        if (this.type === "active") {
          return prj.status === PrijectStatus.Active;
        } else {
          return prj.status === PrijectStatus.Finished;
        }
      });
      console.log("uuu");
      console.log(relevantProjects);
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
    // こうやってリスな追加すれば状態が更新時に実行される
    projectstate.addListener((test) => console.log(`ああああ：${test}`));
    this.renderContent();
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type === "active" ? "実行中プロジェクト" : "完了プロジェクト";
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;

    listEl.innerHTML = "";
    for (const pjtItem of this.assignedProjects) {
      new ProjectItem(listEl.id, pjtItem);
    }
  }
}

// フォーム表示と入力のクラス
class ProjectInput extends Component<HTMLTemplateElement, HTMLFormElement> {
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

    const validateTitle = {
      value: enterdTittle,
      require: true,
    };
    const validateDescription = {
      value: enterdDescription,
      require: true,
      maxLen: 10,
      minLen: 5,
    };
    const validateMonday = {
      value: enterdMondayInput,
      require: true,
      min: 10,
      max: 100,
    };

    if (
      !validate(validateTitle) ||
      !validate(validateDescription) ||
      !validate(validateMonday)
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
  @Autobind
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

new ProjectInput();
const activeList = new ProjectList("active");
const finishList = new ProjectList("finished");
