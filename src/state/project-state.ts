import { PrijectStatus, Project } from "../models/project";

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
export class ProjectState extends State<Project> {
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

export const projectstate = ProjectState.getInstance();
