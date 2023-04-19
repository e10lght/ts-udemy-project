// project type
export enum PrijectStatus {
  Active,
  Finished,
}

// Project Type
export class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public manday: number,
    public status: PrijectStatus
  ) {}
}
