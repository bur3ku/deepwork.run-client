import React, {useState} from 'react'
import Input from 'react-toolbox/lib/input';
import {User} from '../classes';
import {TimeBlock} from '../types/types'
import TaskListEditor from './TaskListEditor';
import { TextFieldProps } from "@material-ui/core";
import {CgRemove} from 'react-icons/cg';
import {BiDetail} from 'react-icons/bi';
import {ImCancelCircle} from 'react-icons/im';
import {RiAddBoxFill} from 'react-icons/ri';
import {strToDayjs} from '../time';

import {
  TimePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import dayjs from 'dayjs';
import DayjsUtils from '@date-io/dayjs';

var customParseFormat = require('dayjs/plugin/customParseFormat');
var utc = require('dayjs/plugin/utc');
var timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

interface PropTypes {
  user: User
  block:TimeBlock
  updateUser:Function
  setBeginValidity:Function
  setEndValidity:Function
  setNameValidity:Function
  allNamesValid:boolean
  allBeginsValid:boolean
  allEndsValid:boolean
  addBlock(startTime:dayjs.Dayjs):void
  index: number
  endIndex:number
  unsavedChanges:boolean
  removeTimeblock:Function
  showDetails:Function
  showTaskDetails:Function
}

const TimeblockComponent = React.memo((props:PropTypes) => {
  const [beginTimeErr, setBeginTimeErr] = useState<string|null>(null);
  const [endTimeErr, setEndTimeErr] = useState<string|null>(null);
  const [showRemoveWarning, setShowRemoveWarning] = useState(false);

  const [begin, setBegin] = useState<dayjs.Dayjs>(strToDayjs(props.block.begin));
  const [end, setEnd] = useState<dayjs.Dayjs>(strToDayjs(props.block.end));

  const setUserBegin = (begin:dayjs.Dayjs) => {
    let newUser = props.user.clone();
    let targetBlock = newUser.timeblocks.find((block:TimeBlock)=>block.id===props.block.id);
    if(targetBlock) targetBlock.begin = begin.format("HH:mm MM/DD/YYYY").slice(0,5);
    else console.error("error: can't find target block");

    props.updateUser(newUser);
  }

  const setUserEnd = (end:dayjs.Dayjs) => {
    let newUser = props.user.clone();
    let targetBlock = newUser.timeblocks.find((block:TimeBlock)=>block.id===props.block.id);
    if(targetBlock) targetBlock.end = end.format("HH:mm MM/DD/YYYY").slice(0,5);
    else console.error("error: can't find target block");

    props.updateUser(newUser);
  }

  const parseAndSetTime = (time:any,beginOrEnd:string) => {
    if(beginOrEnd === "begin"){
      setBeginTimeErr("Incorrect format. Should be [0-24]:[0-59]");
      setBegin(time);
    }else{
      setEndTimeErr("Incorrect format. Should be [0-24]:[0-59]");
      setEnd(time);
    }

    let curBegin = beginOrEnd === "begin" ? time : begin;
    let curEnd = beginOrEnd === "end" ? time : end;

    if(props.index < props.endIndex-1){
      if(curEnd.diff(strToDayjs(props.user.timeblocks[props.index+1].begin))>0){
        setEndTimeErr("End time extends into the next block");
        return;
      }
    }

    if(time.isValid()){
      if(beginOrEnd === "begin"){
        setUserBegin(time);
        props.setBeginValidity(props.block.id, true);
      }else{
        setUserEnd(time);
        props.setEndValidity(props.block.id, true);
      }
    }else{
      if(beginOrEnd === "begin"){
        props.setBeginValidity(props.block.id, false);
      }else{
        props.setEndValidity(props.block.id, false);
      }
      return;
    }

    if(curBegin.diff(curEnd)>=0){
      if(beginOrEnd==="begin") {
        setBeginTimeErr("Begin time must be before the end time");
        props.setBeginValidity(props.block.id, false);
      } else {
        setEndTimeErr("End time must be after the beginning time");
        props.setEndValidity(props.block.id, false);
      }
      return;
    }
    props.setBeginValidity(props.block.id, true);
    props.setEndValidity(props.block.id, true);
    setEndTimeErr(null);
    setBeginTimeErr(null);
  }


  const [isDeepWork, setIsDeepWork] = useState<boolean>(props.block.deepwork);

  const onCheckboxChange = (val:any) => {
    let newUser:User = props.user.clone();
    let i = newUser.timeblocks.findIndex((block:TimeBlock) => block.id === props.block.id);
    newUser.timeblocks[i].deepwork=val.target.checked;

    props.updateUser(newUser);
    setIsDeepWork(val.target.checked);
  }

  const renderInput = (props: TextFieldProps): any => (
    <Input
      type="text"
      onClick={props.onClick}
      value={props.value}
      onChange={props.onChange}
      style={{backgroundColor:endTimeErr===null?"lightgreen":"indianred"}}
    />
  );


  return (
    <div className="timeBlockerBlock" style={{backgroundColor:"#1e1e2f"}}>
      {props.allNamesValid && props.allBeginsValid && props.allEndsValid && props.index === 0 &&
        <RiAddBoxFill style={{"color":"#1e1e2f"}} className="_icon" size={25} onClick={()=>props.addBlock(strToDayjs(props.block.begin).subtract(30,"minute"))}/>
      }

      <TaskListEditor
        tasks={props.user.tasks}
        id={props.block.id}
        showDetails={props.showTaskDetails}
        user={props.user}
        block={props.block}
        updateUser={props.updateUser}
        setNameValidity={props.setNameValidity}
      />

      <MuiPickersUtilsProvider utils={DayjsUtils}>
        <React.Fragment>
          <TimePicker color="primary" value={begin} onChange={(val:any)=>parseAndSetTime(val, "begin")} TextFieldComponent={renderInput} />
          {beginTimeErr && <p style={{color:"red"}}>{beginTimeErr}</p>}
          <TimePicker color="primary" value={end} onChange={(val:any)=>parseAndSetTime(val, "end")} TextFieldComponent={renderInput} />
          {endTimeErr && <p style={{color:"red"}}>{endTimeErr}</p>}
        </React.Fragment>
      </MuiPickersUtilsProvider>
      <div style={{"display": "table-cell","verticalAlign": "middle"}}>
        <label>Deep Work</label>
        <input type="checkbox" checked={isDeepWork} onChange={onCheckboxChange}/>
      </div>
      <div style={{"position":"relative","display":"flex","justifyContent":"flexStart","alignItems":"center","flexDirection":"row"}}>
        <BiDetail className="_icon" style={{backgroundColor:"#1e1e2f","color":"lightblue","marginBottom":"0",fontSize:"calc(20px + 1vw)"}} onClick={()=>props.showDetails(props.block.id)}/>
        {!showRemoveWarning && <CgRemove className="_icon" style={{backgroundColor:"#1e1e2f","color":"indianred","marginBottom":"0", fontSize:"calc(20px + 1vw)"}}  onClick={()=>setShowRemoveWarning(true)}/>}
        {showRemoveWarning && <ImCancelCircle className="_icon" style={{backgroundColor:"#1e1e2f","color":"#ffc266","marginBottom":"0", fontSize:"calc(20px + 1vw)"}} onClick={()=>{setShowRemoveWarning(false)}}/>}
        {showRemoveWarning && <CgRemove className="_icon" style={{backgroundColor:"#1e1e2f","color":"indianred","marginBottom":"0", fontSize:"calc(20px + 1vw)"}} onClick={()=>{props.removeTimeblock(props.block.id); setShowRemoveWarning(false)}}/>}
      </div>
      {props.allNamesValid && props.allBeginsValid && props.allEndsValid &&
        <RiAddBoxFill style={{"color":"#1e1e2f"}} className="_icon" size={25} onClick={()=>props.addBlock(strToDayjs(props.block.end))}/>
      }
    
    </div>

  )
});

export default TimeblockComponent
