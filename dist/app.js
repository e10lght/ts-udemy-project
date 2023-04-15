"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PrijectStatus;
(function (PrijectStatus) {
    PrijectStatus[PrijectStatus["Active"] = 0] = "Active";
    PrijectStatus[PrijectStatus["Finished"] = 1] = "Finished";
})(PrijectStatus || (PrijectStatus = {}));
class Project {
    constructor(id, title, description, manday, status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.manday = manday;
        this.status = status;
    }
}
class State {
    constructor() {
        this.listener = [];
    }
    addListener(listener) {
        console.log(listener);
        this.listener.push(listener);
    }
}
class ProjectState extends State {
    constructor() {
        super();
        this.projects = [];
    }
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }
    addProject(title, description, manday) {
        const newProject = new Project(Math.random().toString(), title, description, manday, PrijectStatus.Active);
        this.projects.push(newProject);
        this.updateListeners();
    }
    moveProject(projectId, newStatus) {
        const project = this.projects.find((prj) => prj.id === projectId);
        if (project && project.status !== newStatus) {
            project.status = newStatus;
            this.updateListeners();
        }
    }
    updateListeners() {
        for (const listenerFn of this.listener) {
            listenerFn(this.projects.slice());
        }
    }
}
const projectstate = ProjectState.getInstance();
function validate(validateInput) {
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
function Autobind(_target, _propatyname, descriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor = {
        configurable: true,
        enumerable: false,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        },
    };
    return adjDescriptor;
}
class Component {
    constructor(temlateId, hostElementId, insertAtStart, newElementId) {
        this.templateElement = document.getElementById(temlateId);
        this.hostElement = document.getElementById(hostElementId);
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        if (newElementId) {
            this.element.id = newElementId;
        }
        this.attach(insertAtStart);
    }
    attach(insertAtBegining) {
        if (insertAtBegining) {
            this.hostElement.insertAdjacentElement("afterbegin", this.element);
        }
        else {
            this.hostElement.insertAdjacentElement("beforeend", this.element);
        }
    }
}
class ProjectItem extends Component {
    get manday() {
        if (this.project.manday < 20) {
            return this.project.manday.toString() + "人日";
        }
        else {
            return (this.project.manday / 20).toString() + "人月";
        }
    }
    constructor(hostid, project) {
        super("single-project", hostid, false, project.id);
        this.project = project;
        this.configure();
        this.renderContent();
    }
    dragStartHandkler(event) {
        event.dataTransfer.setData("text/plane", this.project.id);
        event.dataTransfer.effectAllowed = "move";
    }
    dragEndHandkler(_) {
        console.log("drag終了");
    }
    configure() {
        this.element.addEventListener("dragstart", this.dragStartHandkler);
        this.element.addEventListener("dragend", this.dragEndHandkler);
    }
    renderContent() {
        this.element.querySelector("h2").textContent = this.project.title;
        this.element.querySelector("h3").textContent = this.manday;
        this.element.querySelector("p").textContent = this.project.description;
    }
}
__decorate([
    Autobind
], ProjectItem.prototype, "dragStartHandkler", null);
class ProjectList extends Component {
    constructor(type) {
        super("project-list", "app", false, `${type}-projects`);
        this.type = type;
        this.assignedProjects = [];
        this.configure();
        this.renderContent();
    }
    dragOverHandler(event) {
        if (event.dataTransfer && event.dataTransfer.types[0] === "text/plane") {
            event.preventDefault();
            const listEl = this.element.querySelector("ul");
            listEl.classList.add("droppable");
        }
    }
    dropHandler(event) {
        const prjId = event.dataTransfer.getData("text/plane");
        projectstate.moveProject(prjId, this.type === "active" ? PrijectStatus.Active : PrijectStatus.Finished);
    }
    dragLeaveHandler(_) {
        const listEl = this.element.querySelector("ul");
        listEl.classList.remove("droppable");
    }
    configure() {
        this.element.addEventListener("dragover", this.dragOverHandler);
        this.element.addEventListener("drop", this.dropHandler);
        this.element.addEventListener("dragleave", this.dragLeaveHandler);
        projectstate.addListener((projects) => {
            const relevantProjects = projects.filter((prj) => {
                if (this.type === "active") {
                    return prj.status === PrijectStatus.Active;
                }
                else {
                    return prj.status === PrijectStatus.Finished;
                }
            });
            console.log("uuu");
            console.log(relevantProjects);
            this.assignedProjects = relevantProjects;
            this.renderProjects();
        });
        projectstate.addListener((test) => console.log(`ああああ：${test}`));
        this.renderContent();
    }
    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector("ul").id = listId;
        this.element.querySelector("h2").textContent =
            this.type === "active" ? "実行中プロジェクト" : "完了プロジェクト";
    }
    renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`);
        listEl.innerHTML = "";
        for (const pjtItem of this.assignedProjects) {
            new ProjectItem(listEl.id, pjtItem);
        }
    }
}
__decorate([
    Autobind
], ProjectList.prototype, "dragOverHandler", null);
__decorate([
    Autobind
], ProjectList.prototype, "dropHandler", null);
__decorate([
    Autobind
], ProjectList.prototype, "dragLeaveHandler", null);
class ProjectInput extends Component {
    constructor() {
        super("project-input", "app", true, "user-input");
        this.titleInputElement = this.element.querySelector("#title");
        this.descriptionInputElement = this.element.querySelector("#description");
        this.mandayInputElement = this.element.querySelector("#manday");
        this.configure();
    }
    configure() {
        console.log(this);
        this.element.addEventListener("submit", this.submitHandler);
    }
    renderContent() { }
    gatherUserInput() {
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
        if (!validate(validateTitle) ||
            !validate(validateDescription) ||
            !validate(validateMonday)) {
            alert("正しく入力してください");
            return;
        }
        return [enterdTittle, enterdDescription, Number(enterdMondayInput)];
    }
    clearInputs() {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.mandayInputElement.value = "";
    }
    submitHandler(event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            const [title, desc, manday] = userInput;
            projectstate.addProject(title, desc, manday);
            this.clearInputs();
        }
    }
}
__decorate([
    Autobind
], ProjectInput.prototype, "submitHandler", null);
new ProjectInput();
const activeList = new ProjectList("active");
const finishList = new ProjectList("finished");
