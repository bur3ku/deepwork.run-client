import Login from './Login';
import About from './About';
import Tasks from './Tasks';
import TimeBlocker from "./TimeBlocker";
import Session from "./Session";
import {reqUpdateUser} from "../server";
import {User} from '../classes'
import {createUseStyles} from 'react-jss';
import Popup from 'reactjs-popup';
import IconButton from '@material-ui/core/IconButton';
import {RiQuestionFill} from 'react-icons/ri';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from "react-router-dom";

import React, {useState} from 'react';

const HeaderAndBody = React.memo(() => {
  const [user, setUser] = useState<User | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);

  const saveUser = (user:User) => {
    reqUpdateUser(user)
      .then((res)=>{
        if(res.error) console.log("error updating user: ", res.error);
        else {
          setUnsavedChanges(false);
        }
      })
      .catch((e)=>{
        console.log("error updating user on server: ", e);
      })
  }
  const saveUserWithVal = (user:User) => {
    updateUser(user);
    reqUpdateUser(user)
      .then((res)=>{
        if(res.error) console.log("error updating user: ", res.error);
        else {
          setUnsavedChanges(false);
        }
      })
      .catch((e)=>{
        console.log("error updating user on server: ", e);
      })
  }
  const signup = async (user:any) => {
    let newUser:User = await User.new(user.username, user.password);
    saveUser(newUser);
  }

  const login = (user:User) => {
    setUser(user);
  }

  const updateUser = (user:User) => {
    setUser(user);
    setUnsavedChanges(true);
  }
  const time = new Date();
  time.setSeconds(time.getSeconds() + 600); // 10 minutes timer

  const classes = createUseStyles({
    headerBodyContainer: {
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
      alignContent: "stretch",
      justifyContent: "stretch",
      alignItems: "stretch",
      justifyItems: "stretch"
    },
    headerContainer: {
      flexGrow: 0,
      flexBasis: "10vh",
      display: "flex",
      flexDirection: "row",
      width: "100%",
      justifyContent: "space-between",
      margin: "0",
      alignItems: "stretch",
      flexWrap: "nowrap"
    },
    headerItemContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexGrow: 20,
      backgroundColor: "#1e1e2f",
      '& h2': {
        margin: "0",
        color: "lightgray",
        fontSize: "calc(12px + 1vw)"
      }
    },
    headerItemContainerSmall: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexGrow: 2,
      backgroundColor: "#1e1e2f",
      '& h2': {
        margin: "0",
        color: "lightgray",
        fontSize: "calc(12px + 1vw)"
      }
    }
  })();

  return (
    <div className={classes.headerBodyContainer}>
      <Router>
        <div className={classes.headerContainer}>

          <div className={classes.headerItemContainerSmall}>
              <Login user={user} login={login} signup={signup} saveUserWithVal={saveUserWithVal}/>
          </div>

          <div className="headerSpacer"></div>

          <div className={classes.headerItemContainer}>
            <Link to="/tasks">
              <h2>
                Tasks
              </h2>
            </Link>
            <Popup contentStyle={{"background":"#1e1e2f","width":"20vw"}} position="bottom center" trigger={()=>(
              <IconButton style={{padding:"0",width:".7em",top:"-.5em"}}><RiQuestionFill style={{margin:"0"}}/></IconButton>
            )}>
              The Tasks page lets you create tasks, which make up your day.
            </Popup>
          </div>
          
          <div className="headerSpacer"></div>

          <div className={classes.headerItemContainer}>
            <Link to="/timeblocker">
              <h2>
                Time Blocks
              </h2>
            </Link>
            <Popup contentStyle={{"background":"#1e1e2f","width":"20vw"}} position="bottom center" trigger={()=>(
              <IconButton style={{padding:"0",width:".7em",top:"-.5em"}}><RiQuestionFill style={{margin:"0"}}/></IconButton>
            )}>
                The Time Blocks page follows the Rhymthmic deep work philosophy, which "argues that the easiest way to
                consistently start deep work sessions is to transform them into a simple regular habit". In action, this
                means each day is divided into deep work and shallow work intervals. The Time Blocks page allows you to
                create templates. Each template outlines a daily schedule. Each day, you can choose from one of your templates.
            </Popup>
          </div>

          <div className="headerSpacer"></div>

          <div className={classes.headerItemContainer}>
            <Link to="/session">
              <h2>
                Session
              </h2>
            </Link>
            <Popup contentStyle={{"background":"#1e1e2f","width":"20vw"}} position="bottom center" trigger={()=>(
              <IconButton style={{padding:"0",width:".7em",top:"-.5em"}}><RiQuestionFill style={{margin:"0"}}/></IconButton>
            )}>
              The Session page is where you go during a deep work session. It provides a notepad, timer...
            </Popup>
          </div>

          <div className="headerSpacer"></div>

          <Link className={classes.headerItemContainerSmall} style={{color:"black"}} to="/about">
            <div>
                <h2>
                  About
                </h2>
            </div>
          </Link>
          </div>
        <div className="mainContent">
          <Switch>
              <Route path="/about" render={()=><About/>}/>
              <Route path="/timeblocker" render={()=>{
                return user?
                  <TimeBlocker
                    unsavedChanges={unsavedChanges}
                    user={user}
                    updateUser={updateUser}
                    saveUserWithVal={saveUserWithVal}
                    saveUser={()=>saveUser(user)}
                  />
                :
                  <p style={{color:"red",backgroundColor:"white",borderRadius:"10px",padding:"5px"}}>You need to login</p>
              }}/>
              <Route path="/tasks" render={()=>{
                return user?
                  <Tasks
                    unsavedChanges={unsavedChanges}
                    user={user}
                    updateUser={updateUser}
                    saveUser={()=>saveUser(user)}
                  />
                :
                  <p style={{color:"red",backgroundColor:"white",borderRadius:"10px",padding:"5px"}}>You need to login</p>
              }}/>
              <Route path="/session" render={()=>{
                return user?
                <Session
                  expiryTimestamp={time.getTime()}
                  user={user}
                  updateUser={updateUser}
                />
                :
                <p style={{color:"red",backgroundColor:"white",borderRadius:"10px",padding:"5px"}}>You need to login</p>
              }}/>
          </Switch>
        </div>
      </Router>
    </div>
  )
})

export default HeaderAndBody