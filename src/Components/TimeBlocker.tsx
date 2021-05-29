import React, {useState, useRef} from 'react';
import TimeblockComponent from './Timeblock';
import {TimeBlock, Task, Template} from '../types/types';
import {User} from '../classes';
import dayjs from 'dayjs'
import {convertToRaw, convertFromRaw, EditorState} from 'draft-js';
import Editor from './Editor';
import {getCurTime, strToDayjs} from '../time';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import IconButton from '@material-ui/core/IconButton';
import {RiQuestionFill} from 'react-icons/ri';
import { Select, MenuItem } from '@material-ui/core';

const TimeBlocker = React.memo((
  props:{
    user: User
    updateUser: Function
    saveUser: Function
    unsavedChanges: boolean
    saveUserWithVal: Function
  }
  ) => {
  const [nameValidities, setNameValidities] = useState<{[key: number]:boolean}>({0:true});
  const [allNamesValid, setAllNamesValid] = useState<boolean>(true);

  const [beginValidities, setBeginValidities] = useState<{[key: number]:boolean}>({0:true});
  const [allBeginsValid, setAllBeginsValid] = useState<boolean>(true);

  const [endValidities, setEndValidities] = useState<{[key: number]:boolean}>({0:true});
  const [allEndsValid, setAllEndsValid] = useState<boolean>(true);

  const [showDetails, setShowDetails] = useState(false);
  const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty());

  const [editorId, setEditorId] = useState(props.user.timeblocksId);
  
  const setNameValidity = (id:number,valid:boolean) => {
    let newNameValidities = {...nameValidities};
    newNameValidities[id]=valid;
    setNameValidities(newNameValidities);

    for(const key in newNameValidities){
      if(!newNameValidities[key]) {
        setAllNamesValid(false);
        return;
      }
    }
    setAllNamesValid(true);
  }

  const setBeginValidity = (id:number,valid:boolean) => {
    let newBeginValidities = {...beginValidities};
    newBeginValidities[id]=valid;
    setBeginValidities(newBeginValidities);

    for(const key in newBeginValidities){
      if(!newBeginValidities[key]) {
        setAllBeginsValid(false);
        return;
      }
    }
    setAllBeginsValid(true);
  }


  const setEndValidity = (id:number,valid:boolean) => {
    let newEndValidities = {...endValidities};
    newEndValidities[id]=valid;
    setEndValidities(newEndValidities);

    for(const key in newEndValidities){
      if(!newEndValidities[key]) {
        setAllEndsValid(false);
        return;
      }
    }
    setAllEndsValid(true);
  }

  const addBlock = (startTime:dayjs.Dayjs) => {
    let userCopy:User = props.user.newTimeblock();
    userCopy.timeblocks.push({
      name: "",
      details: "",
      begin: startTime.format("HH:mm MM/DD/YYYY").slice(0,5),
      end: startTime.add(30,"minute").format("HH:mm MM/DD/YYYY").slice(0,5),
      deepwork: false,
      id: userCopy.timeblocksId
    });

    props.updateUser(userCopy);

    setAllNamesValid(false);
    setAllBeginsValid(true);
    setAllEndsValid(true);

    setBeginValidity(userCopy.timeblocksId,true);
    setEndValidity(userCopy.timeblocksId,true);
  }

  const removeTimeblock = (id:number) => {
    let userCopy = props.user.clone();
    let newTimeblocks = userCopy.timeblocks.filter((block:TimeBlock) => block.id !== id);
    userCopy.timeblocks = newTimeblocks;
    props.updateUser(userCopy);
    setBeginValidity(id,true);
    setEndValidity(id,true);
    setNameValidity(id,true);
  }

  const changeDetails = (state:EditorState, id:number) => {
    let newDetailsRaw = convertToRaw(state.getCurrentContent());
    let newDetails=JSON.stringify(newDetailsRaw);
    let user:User = props.user.clone();
    if(editorOnChange==="timeblock"){
      let i = user.timeblocks.findIndex((block:TimeBlock) => block.id === id);
      user.timeblocks[i].details=newDetails;
    }else if(editorOnChange==="task"){
      let i = user.tasks.findIndex((task:Task) => task.id === id);
      user.tasks[i].details=newDetails;
    }

    props.updateUser(user);
  }

  const [editorOnChange, setEditorOnChange] = useState<string>("");
  
  const showTimeblockDetails = (id:number) => {
    setEditorId(id);
    setEditorOnChange("timeblock");
    let block=props.user.timeblocks.find((block:TimeBlock)=>block.id===id);
    if(block) {
      if(block.details.length>0)setEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(block.details))));
     }else{
      alert("Can't find block. May have been deleted.");
      return;
    }
    setShowDetails(true);
  }

  const showTaskDetails = (id:number) => {
    setEditorId(id);
    setEditorOnChange("task");
    let task=props.user.tasks.find((task:Task)=>task.id===id);
    if(task) {
      if(task.details.length>0)setEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(task.details))));
    }else{
      alert("Can't find task. May have been deleted.");
      return;
    }
    setShowDetails(true);
  }

  const [templateName, setTemplateName] = useState<string>("");
  const templateInputRef = useRef<any>();
  const saveAsTemplate = (event:any) => {
    event.preventDefault();
    if(props.user.templates.filter((template:Template)=>template.name === templateName).length !== 0){
      return alert("there's already a template with that name. Delete the old one first.");
    }
    if(templateName.length === 0) return alert("no name supplied");
    let user:User = props.user.clone();
    user.templates.push({name: templateName, timeblocks: user.timeblocks});
    props.saveUserWithVal(user);
    templateInputRef.current.value=""
    setTemplateName("");
  }

  const overrideTemplate = (event:any) => {
    event.preventDefault();
    let user:User = props.user.clone();
    let i = user.templates.findIndex((template:Template)=>template.name === props.user.selectedTemplate);
    user.templates[i].timeblocks = props.user.timeblocks;
    props.saveUserWithVal(user);
    templateInputRef.current.value="";
  }

  const _setSelectedTemplate = (name: string) => {
    if(!name) name = "";
    let user:User = props.user.clone();
    user.selectedTemplate = name;
    let template = user.templates.find((template:Template) => template.name === name);
    if(template) user.timeblocks = template.timeblocks;

    props.updateUser(user);
  }

  const deleteTemplate = () => {
    let user:User = props.user.clone();
    user.selectedTemplate = "";
    let templates = user.templates.filter((template:Template) => template.name !== props.user.selectedTemplate);
    user.templates = templates;
    props.saveUserWithVal(user);
  }
  return (
    <div className="timeBlockerContainerOuter">
        {showDetails &&
          <Editor
            onChange={(state:EditorState,id:number)=>changeDetails(state, id)}
            hideDetails={()=>setShowDetails(false)}
            tasks={props.user.tasks}
            id={editorId}
            showDetails={showTaskDetails}
            editorState={editorState}
            setEditorState={setEditorState}
          />
        }
      <div className="timeBlockerContainerBlocks">
      {props.unsavedChanges && allNamesValid && allBeginsValid && allEndsValid &&
          <button type="button"
          style={{"backgroundColor":"indianred"}}
          onClick={()=>props.saveUser()}>
            Save Changes
          </button>
        }
        {!allNamesValid &&
          <h4 style={{"color":"indianred","margin":"2px"}}> Not all names are valid. Are they all filled in? </h4>
        }
        {allNamesValid && !(props.unsavedChanges && allNamesValid && allBeginsValid && allEndsValid) &&
          <h4 style={{"color":"lightgreen","margin":"2px"}}> Changes Saved </h4>
        }
        <div style={{border:"1px solid black",width:"30vw",display:"flex",flexDirection:"column",alignItems:"center",marginTop:"5spx"}}>
          <h3 style={{margin:0}}>Templates</h3>
          {props.user.selectedTemplate!==null && (props.user.selectedTemplate.length === 0 || props.user.selectedTemplate.length > 0) &&
            <div>
              <button onClick={deleteTemplate}>Delete</button>
              <button onClick={overrideTemplate}>Override</button>
            </div>
          }
          <div style={{display:'flex',flexDirection:'row',backgroundColor:'rgb(255,255,255,0.1)',margin:"5px"}}>
            <label style={{fontSize:"20px"}}>Current&nbsp;</label>
            <Select
                labelId="demo-simple-select-helper-label"
                id="demo-simple-select-helper"
                value={props.user.selectedTemplate}
                onChange={(event:any)=>_setSelectedTemplate(event.target.value)}
              >
                {
                  props.user.templates.map((template:Template) => 
                    <MenuItem value={template.name}>{template.name}</MenuItem>
                  )
                }
            </Select>
          </div>
      <div style={{display:'flex',flexDirection:'row',backgroundColor:'rgb(255,255,255,0.1)',marginBottom:"5px",alignItems:"center",height:"100%"}}>
        <label style={{fontSize:"20px"}}>Save as&nbsp;</label>
        <form onSubmit={saveAsTemplate} style={{display:'flex',flexDirection:'row',alignItems:"stretch"}}>
          <input style={{fontSize:"20px"}} ref={templateInputRef} placeholder="name" onChange={(e:any)=>setTemplateName(e.target.value)}/>
          <button type="submit">Submit</button>
        </form>
      </div>

        </div>
        {props.user.timeblocks.length>0 &&
          props.user.timeblocks
          .sort((x:TimeBlock, y:TimeBlock)=>strToDayjs(x.begin).diff(strToDayjs(y.begin),"minute"))
          .map((block:TimeBlock,index:number,arr:TimeBlock[]) =>
          <div className="timeBlockerContainerBlocks" key={block.id}>
            <TimeblockComponent
              user={props.user}
              updateUser={props.updateUser}
              block={block}
              setBeginValidity={setBeginValidity}
              setEndValidity={setEndValidity}
              setNameValidity={setNameValidity}
              allNamesValid={allNamesValid}
              allBeginsValid={allBeginsValid}
              allEndsValid={allEndsValid}
              addBlock={addBlock}
              index={index}
              endIndex={arr.length}
              unsavedChanges={props.unsavedChanges}
              removeTimeblock={removeTimeblock}
              showDetails={showTimeblockDetails}
              showTaskDetails={showTaskDetails}
            />
          </div>
        )
        }
        {props.user.timeblocks.length===0 &&
          <button type="button"
            onClick={()=>addBlock(getCurTime())}
            >Add block
          </button>
        }
      </div>
      <div className="timeBlockerContainerDeadlines">
        {
          props.user.tasks.filter((task:Task)=>dayjs(task.deadline.buffer).diff(getCurTime())<=86400000).map((task:Task)=>
                <Popup key={task.id} contentStyle={{"background":"#1e1e2f"}} position="right center" on="hover" trigger={()=>(
                  <div className="deadline" style={{backgroundColor:dayjs(task.deadline.buffer).diff(getCurTime())>=0?"red":"indianred"}}></div>
                )}>
                  <span
                    style={{color: "#575f67",
                      "cursor": "pointer",
                      "display": "inline-block",
                      "background": "#e6f3ff",
                      "paddingLeft": "2px",
                      "paddingRight": "2px",
                      "borderRadius": "2px",
                      "textDecoration": "none",
                    }}
                    onClick={() => {
                      showTaskDetails(task.id);
                    }}
                  >
                    Task: {task.name}
                    <br></br>
                    Due: {dayjs(task.deadline.due).format("MM/DD@HH:mm")}
                    <br></br>
                  </span>
                </Popup>
          )
        }
        {
          props.user.tasks.filter((task:Task)=>dayjs(task.deadline.buffer).diff(getCurTime())<=86400000).length > 0 ?
            <Popup contentStyle={{"background":"#1e1e2f","width":"20vw"}} position="bottom center" trigger={()=>(
              <IconButton style={{padding:"0"}}><RiQuestionFill style={{margin:"0"}}/></IconButton>
            )}>
              Each red bar represents a deadline buffer that extends back to the present day. Hover over a bar to see its details.
            </Popup>
          : null
        }

      </div>
      {props.user.username.length===0 &&
        <p>Login to access time blocker</p>
      }
    </div>
      
  )
});

export default TimeBlocker