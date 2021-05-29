import React, {useState, useRef, useEffect} from 'react';
import TaskComponent from './Task';
import {convertToRaw, convertFromRaw, EditorState} from 'draft-js';
import {Task} from '../types/types';
import {User} from "../classes";
import Editor from './Editor';
import {RiAddBoxFill} from 'react-icons/ri';
import Input from 'react-toolbox/lib/input';

interface Props {
  user: User
  updateUser: Function
  saveUser: Function
  unsavedChanges: boolean
}
function useTraceUpdate(props:any) {
  const prev = useRef(props);
  useEffect(() => {
    const changedProps = Object.entries(props).reduce((ps:any, [k, v]) => {
      if (prev.current[k] !== v) {
        ps[k] = [prev.current[k], v];
      }
      return ps;
    }, {});
    if (Object.keys(changedProps).length > 0) {
      alert('Changed props:' + changedProps);
    }
    prev.current = props;
  });
}
const Tasks = React.memo((props:Props) => {
  const [emptyNames, setEmptyNames] = useState<{[key: number]:boolean}>({0:false});
  const [emptyName, setEmptyName] = useState(false);
  const [editorEnabled, setEditorEnabled] = useState(false);
  const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty());
  const [editorTaskId, setEditorTaskId] = useState<number>(0);
  useTraceUpdate(props);
  // useEffect(()=>{
  //   alert("tasks rerendered");
  // })
  const showDetails = (id:number) => {
    setEditorTaskId(id);
    let task=props.user.tasks.find((task:Task)=>task.id===id);
    if(task) {
      if(task.details === ""){
        task.details = JSON.stringify(convertToRaw(EditorState.createEmpty().getCurrentContent()));
      }
      setEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(task.details))))
    }else{
      alert("can't find task");
    }
    setEditorEnabled(true);
  }

  const hideDetails = () => {
    setEditorEnabled(false);
  }

  const changeName = (newName:string, id:number) => {
    let user = props.user.clone();
    let i = user.tasks.findIndex((task:Task) => task.id === id);
    user.tasks[i].name = newName;

    props.updateUser(user);
    
    let emptyNamesCopy = {...emptyNames};
    emptyNamesCopy[id] = (newName === "");
    setEmptyNames(emptyNamesCopy);

    for(const key in emptyNamesCopy){
      if(emptyNamesCopy[key]) {
        setEmptyName(true);
        return;
      }
    }
    setEmptyName(false);
  }

  const changeDeadline = (newDeadline:string, newDeadlineBuffer:string, id:number) => {
    let user = props.user.clone();
    let i = user.tasks.findIndex((task:Task) => task.id === id);
    user.tasks[i].deadline = {"due": newDeadline, "buffer":newDeadlineBuffer};

    props.updateUser(user);
  }

  const changeDetails = (state:EditorState) => {
    let newDetailsRaw = convertToRaw(state.getCurrentContent());
    let newDetails=JSON.stringify(newDetailsRaw);
    let user:User = props.user.clone();
    let i = user.tasks.findIndex((task:Task) => task.id === editorTaskId);
    user.tasks[i].details=newDetails;

    props.updateUser(user);
  }

  const newTask = () => {
    let newUser = props.user.newTask();
    newUser.tasks.unshift({"name":"","details":JSON.stringify(convertToRaw(EditorState.createEmpty().getCurrentContent())),"id":newUser.tasksId,"deadline":{"due":"","buffer":""}});
    let emptyNamesCopy = {...emptyNames};
    emptyNamesCopy[newUser.tasksId] = true;
    setEmptyNames(emptyNamesCopy);
    setEmptyName(true);

    props.updateUser(newUser);
  }

  const removeTask = (taskId:number) => {
    let userCopy = props.user.clone();
    let newTasks = userCopy.tasks.filter((task:Task) => task.id !== taskId);
    userCopy.tasks = newTasks;

    props.updateUser(userCopy);
  }

  const saveTasks = () => {
    props.saveUser();
  }

  const nameSearchRef = useRef<Input | null>(null);

  const [nameSearch, setNameSearch] = useState("");
  
  const _setNameSearch = (val:string)=>{
    setNameSearch(val);
    //override TaskComponent autofocus
    setTimeout(()=>nameSearchRef.current?.focus(),0);
  }
  return (
    <div className="tasksContainer">
      {!props.user.tasks &&
      <p>login to access tasks</p>
      }
      {props.user.tasks.length !== 0 &&
        <Input
          /* @ts-ignore */
          placeholder="search by name"
          type="text"
          value={nameSearch}
          onChange={_setNameSearch}
          innerRef={nameSearchRef}
        />
      }

      {!emptyName && !props.unsavedChanges &&
        <RiAddBoxFill className="_icon" size={25} onClick={()=>newTask()}/>
      }

      {props.user.tasks &&
      props.user.tasks.map((task:Task)=>
        task.name.includes(nameSearch)?
          <TaskComponent
            key={task.id}
            task={task}
            changeName={changeName}
            changeDeadline={changeDeadline}
            removeTask={removeTask}
            unsavedChanges={props.unsavedChanges}
            showDetails={showDetails}
            tasksId={task.id}
          />
          : null
      )}
      {props.unsavedChanges && !emptyName && <button style={{backgroundColor:"indianred"}} type="button" onClick={saveTasks} >Save Changes</button>}

      {!emptyName && !props.unsavedChanges &&
        <h3 style={{"color":"lightgreen","margin":"2px"}}>Changes Saved</h3>
      }
      {editorEnabled &&
        <Editor
          onChange={changeDetails}
          hideDetails={hideDetails}
          tasks={props.user.tasks}
          showDetails={showDetails}
          editorState={editorState}
          setEditorState={setEditorState}
          id={editorTaskId}
        />
      } 
    </div>
  )
});

export default Tasks
