import { Autobind } from "../decorators/autobind";
import { DragTarget } from "../models/drag-drop";
import { PrijectStatus, Project } from "../models/project";
import { projectstate } from "../state/project-state";
import { Component } from "./base-component";
import { ProjectItem } from "./project-item";

// プロジェクトのリストを表示するクラス
export class ProjectList
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
