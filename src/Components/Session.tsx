import React, {useState} from 'react'
import { useTimer } from 'react-timer-hook';
import { Switch, Select, MenuItem } from '@material-ui/core';
import {User} from '../classes'
import {dayjsToStr, getCurTime, strToDayjs} from "../time"
import {TimeBlock} from '../types/types'
import TextField from '@material-ui/core/TextField';
import useSound from 'use-sound';
// @ts-ignore
import beeping from "../beeping.mp3";
interface PropTypes {
  expiryTimestamp: number
  user: User
  updateUser: Function
}

const Session = (props:PropTypes) => {  
  const [fromTimeblock, setFromTimeblock] = useState(false);
  const [timeblocks, setTimeblocks] = useState<TimeBlock[]>([]);
  const [selectedTimeblock, setSelectedTimeblock] = useState<string>("");
  const [play] = useSound(beeping);
  const expiryTimestamp = new Date();
  expiryTimestamp.setSeconds(expiryTimestamp.getSeconds()+30*60);

  const {
    seconds,
    minutes,
    hours,
    isRunning,
    start,
    pause,
    resume,
    restart,
  } = useTimer({ expiryTimestamp:expiryTimestamp.getTime(), onExpire: play});

  const toggleFromTimeblock = () => {
    let newFromTimeblock = !fromTimeblock;
    setFromTimeblock(newFromTimeblock);
    if(newFromTimeblock){
      let curTimeblocks = props.user.timeblocks;
      let curTime = getCurTime();
      curTimeblocks = curTimeblocks.sort((a:TimeBlock,b:TimeBlock)=>Math.abs(Math.abs(curTime.diff(strToDayjs(a.begin))) - curTime.diff(strToDayjs(b.begin))));
      setTimeblocks(curTimeblocks);
    }
  }
  const setSelectedTimeblockButton = (event:any) => {
    setSelectedTimeblock(event.target.value);
    let timeblock = props.user.timeblocks.find((block:TimeBlock)=>block.name===event.target.value);
    const time = new Date();

    if(timeblock) {
      let timeBlockEndDiffBeginMins = strToDayjs(timeblock.end).diff(strToDayjs(timeblock.begin), "minute");
      time.setMinutes(time.getMinutes() + timeBlockEndDiffBeginMins);
      let timeBlockBeginDiffCurTimeMins = strToDayjs(timeblock.begin).diff(strToDayjs(dayjsToStr(getCurTime())), "minute");
      if(timeBlockBeginDiffCurTimeMins > (-1 * timeBlockEndDiffBeginMins) && timeBlockBeginDiffCurTimeMins < 0) {
        time.setMinutes(time.getMinutes() + timeBlockBeginDiffCurTimeMins);
        restart(time.getTime());
      }else{
        restart(time.getTime());
        pause();
      }
    }
  }

  const [height] = useState<string>("20vh");
  const [width] = useState<string>("8vw");
  const [labelOffset] = useState<string>("3vh");

  const restartTimer = (hours:number, minutes:number, seconds:number) => {
    const time = new Date();
    time.setSeconds(time.getSeconds() + hours * 60 * 60 + minutes * 60 + seconds);
    restart(time.getTime());
    pause();
  }
  return (
    <div style={{textAlign: 'center'}}>
      <div>
        <label>{fromTimeblock?"From timeblock":"Custom"}</label>
        <Switch checked={fromTimeblock} onChange={toggleFromTimeblock}/>
      </div>
      {fromTimeblock &&
        <Select
            labelId="demo-simple-select-helper-label"
            id="demo-simple-select-helper"
            value={selectedTimeblock}
            onChange={setSelectedTimeblockButton}
          >
            {
              timeblocks.map((block:TimeBlock) => 
                <MenuItem value={block.name}>{JSON.parse(block.name).blocks[0].text}</MenuItem>
              )
            }
        </Select>
      }
      <div style={{fontSize: '100px'}}>
          <TextField style={{height}}
            onChange={(val:any)=>restartTimer(parseInt(val.target.value.length > 0 ? val.target.value : 0), minutes, seconds)}
            value={hours.toLocaleString('en-US', {minimumIntegerDigits: 2,useGrouping: false})}
            InputLabelProps={{
              style: {
                top: labelOffset
              }
            }}
            inputProps={{
              style: {
                height,
                width,
                padding: '0 14px',
                fontSize: "12vh"
              }
            }}
            id="outlined-basic" label="Hours" variant="outlined"
          />
          :
          <TextField style={{height}}
            value={minutes.toLocaleString('en-US', {minimumIntegerDigits: 2,useGrouping: false})}
            onChange={(val:any)=>restartTimer(hours, parseInt(val.target.value.length > 0 ? val.target.value : 0), seconds)}
            InputLabelProps={{
              style: {
                top: labelOffset
              }
            }}
            inputProps={{
              style: {
                height,
                width,
                padding: '0 14px',
                fontSize: "12vh"
              }
            }}
            id="outlined-basic" label="Minutes" variant="outlined"
          />
          :
          <TextField style={{height}}
            value={seconds.toLocaleString('en-US', {minimumIntegerDigits: 2,useGrouping: false})}
            onChange={(val:any)=>restartTimer(hours, minutes, parseInt(val.target.value.length > 0 ? val.target.value : 0))}
            InputLabelProps={{
              style: {
                top: labelOffset
              }
            }}
            inputProps={{
              style: {
                height,
                width,
                padding: '0 14px',
                fontSize: "12vh"
              }
            }}
            id="outlined-basic" label="Seconds" variant="outlined"
          />
      </div>
      <p>{isRunning ? 'Running' : 'Not running'}</p>
      <button onClick={start}>Start</button>
      <button onClick={pause}>Pause</button>
      <button onClick={resume}>Resume</button>
      <button onClick={() => {
        // Restarts to 5 minutes timer
        const time = new Date();
        time.setSeconds(time.getSeconds() + 300);
        restart(time.getTime());
        pause();
      }}>Restart</button>
    </div>
  );
}

export default Session
