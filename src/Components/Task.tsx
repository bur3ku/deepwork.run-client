import React, {useRef, useEffect, useState} from 'react';
import Input from 'react-toolbox/lib/input';
import {Task} from '../types/types';
import {CgRemove} from 'react-icons/cg';
import {BiDetail} from 'react-icons/bi';
import {ImCancelCircle} from 'react-icons/im';
import { Switch } from '@material-ui/core';
//@ts-ignore
import DayjsUtils from '@date-io/dayjs';
import TextField from '@material-ui/core/TextField';

import { DatePicker, DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import dayjs from 'dayjs';

interface Props {
  task: Task,
  tasksId: number
  changeName: Function,
  changeDeadline: Function,
  removeTask: Function,
  unsavedChanges:boolean,
  showDetails: Function
}

const TaskComponent = React.memo((props:Props) => {
  const inputRef = useRef<Input>();
  const [showRemoveWarning, setShowRemoveWarning] = useState(false);
  useEffect(()=>{
    inputRef?.current?.focus();
  },[])
  const changeName = (newName:string) => {
    props.changeName(newName, props.task.id);
  }

  const removeTask = (taskId:number) => {
    props.removeTask(taskId);
  }

  const deadlineBufferOnChange = (date:MaterialUiPickersDate) => {
    if(date) setDeadlineBuffer(date);
    props.changeDeadline(deadline.toISOString(), date, props.task.id);
  }

  const deadlineOnChange = (date:MaterialUiPickersDate) => {
    if(date) setDeadline(date);
    props.changeDeadline(date?.toISOString(), deadlineBuffer, props.task.id);
  }
  
  const hasDeadlineOnChange = (hasDeadline:boolean) => {
    setHasDeadline(hasDeadline);
    if(!hasDeadline) {
      props.changeDeadline("", "", props.task.id);
    }else{
      props.changeDeadline(deadline, deadlineBuffer, props.task.id);
    }
  }

  const [hasDeadline, setHasDeadline] = useState(props.task.deadline.due.length>0);
  const [deadline, setDeadline] = useState(props.task.deadline.due.length > 0 ? dayjs(props.task.deadline.due) : dayjs());
  const [deadlineBuffer, setDeadlineBuffer] = useState(props.task.deadline.buffer.length > 0 ? dayjs(props.task.deadline.buffer) : dayjs());

  return (
      <div className="tasksItemContainer">
        <div className="tasksItem" style={{backgroundColor:'#1e1e2f'}}>
          <Input
            /* @ts-ignore */
            placeholder="name"
            type="text"
            value={props.task.name}
            onChange={changeName}
            innerRef={inputRef}
          />
          <div>
          <label>Deadline</label>
          <Switch checked={hasDeadline} onChange={()=>hasDeadlineOnChange(!hasDeadline)}/>
          </div>
          {hasDeadline &&
            <MuiPickersUtilsProvider utils={DayjsUtils}>
              <React.Fragment>
                <DateTimePicker
                //@ts-ignore
                  renderInput={(props:any) => <TextField {...props} />}
                  label="Deadline"
                  value={deadline}
                  onChange={(date:any) => deadlineOnChange(date)}
                  InputLabelProps={{
                    style: {"color":"lightgray"}
                  }}
                  InputProps={{
                    style: {"color":"lightgray"}
                  }}
                />
                <p></p>
                <DatePicker
                //@ts-ignore
                  renderInput={(props:any) => <TextField {...props} />}
                  label="Deadline Buffer Start"
                  value={deadlineBuffer}
                  onChange={(date:MaterialUiPickersDate) => deadlineBufferOnChange(date)}
                  InputLabelProps={{
                    style: {"color":"lightgray"}
                  }}
                  InputProps={{
                    style: {"color":"lightgray"}
                  }}
                />
              </React.Fragment>
            </MuiPickersUtilsProvider>
          }
          <div style={{"position":"relative","left":"0","display":"flex","justifyContent":"center","alignItems":"center","flexDirection":"row","width":"100%"}}>
            <BiDetail className="_icon" style={{backgroundColor:"#1e1e2f","color":"lightblue","marginBottom":"0"}} size={"30px"} onClick={()=>props.showDetails(props.tasksId)}/>
            {!showRemoveWarning && <CgRemove className="_icon" style={{backgroundColor:"#1e1e2f","color":"indianred","marginBottom":"0",fontSize:"30px"}} onClick={()=>setShowRemoveWarning(true)}/>}
            {showRemoveWarning && <ImCancelCircle className="_icon" style={{backgroundColor:"#1e1e2f","color":"#ffc266","marginBottom":"0"}} size={"30px"} onClick={()=>{setShowRemoveWarning(false)}}/>}
            {showRemoveWarning && <CgRemove className="_icon" style={{backgroundColor:"#1e1e2f","color":"indianred","marginBottom":"0"}} size={"30px"} onClick={()=>{if(props.task.id) removeTask(props.task.id); setShowRemoveWarning(false)}}/>}
          </div>
        </div>
      </div>
  )
})

export default TaskComponent;

