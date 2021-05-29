import {Task, TimeBlock, Template} from './types/types'
export class User {
  constructor(_id:string,username:string,password:string,tasks:Task[],tasksId:number,timeblocks:TimeBlock[],timeblocksId:number,templates:Template[],selectedTemplate:string){
    this.username = username;
    this.password = password;
    this.tasks =    tasks;
    this.tasksId =  tasksId;
    this.timeblocks=timeblocks;
    this.timeblocksId=timeblocksId;
    this.templates=templates;
    this.selectedTemplate = selectedTemplate;
    this._id = _id;
  }
  username: string;
  password: string;
  tasks: Task[];
  tasksId: number;
  timeblocks: TimeBlock[];
  timeblocksId: number;
  templates: Template[];
  selectedTemplate: string;
  _id: string;
  static async new(username:string,password:string) {
    return new User("", username, password, [{
      name: "Go on a run",
      id: 0,
      details: "",
      deadline: {
        due: "",
        buffer: ""
      }
    }], 0, [], 0, [], "");
  }
  getTaskById(id:number) {
    return this.tasks.find((task:Task) => task.id === id);
  }
  toObj(){
    return {
      _id: this._id,
      username: this.username,
      password:this.password,
      tasks:this.tasks,
      tasksId: this.tasksId,
      timeblocks:this.timeblocks,
      timeblocksId:this.timeblocksId,
      templates:this.templates,
      selectedTemplate:this.selectedTemplate
    };
  }
  newTask():User{
    return new User(this._id, this.username, this.password, this.tasks, this.tasksId+1, this.timeblocks, this.timeblocksId, this.templates, this.selectedTemplate);
  }
  newTimeblock():User{
    return new User(this._id, this.username, this.password, this.tasks, this.tasksId, this.timeblocks, this.timeblocksId+1, this.templates, this.selectedTemplate);
  }
  clone():User{
    return new User(this._id, this.username, this.password, this.tasks, this.tasksId, this.timeblocks, this.timeblocksId, this.templates, this.selectedTemplate)
  }
}