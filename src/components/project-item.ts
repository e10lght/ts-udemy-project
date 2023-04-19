import { Autobind } from "../decorators/autobind";
import { Draggable } from "../models/drag-drop";
import { Project } from "../models/project";
import { Component } from "./base-component";

// それぞれのプロジェクトのリストアイテムを要素として追加するクラス
export class ProjectItem
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
