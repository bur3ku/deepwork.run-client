import React, {useState, useEffect, useRef} from 'react';
import {reqSignup, reqLogin} from "../server";
import {User} from '../classes';
import {createUseStyles} from 'react-jss'
export default function Login (props: {login: Function, signup: Function, user:User | null, saveUserWithVal:Function}) {
  const [errorMsg, setErrorMsg] = useState("");
  const [formToggle, setFormToggle] = useState(false);
  const [changeUsernameToggle, setChangeUsernameToggle] = useState(false);
  const [changePasswordToggle, setChangePasswordToggle] = useState(false);
  const [signupToggle, setSignupToggle] = useState(false);
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const newPasswordInputRef = useRef<HTMLInputElement>(null);
  const repeatedPasswordRef = useRef<HTMLInputElement>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  let submit = (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let password = passwordInputRef.current?.value;
    let username = usernameInputRef.current?.value;
    let repeatedPassword = repeatedPasswordRef.current?.value;

    if(signupToggle){
      if(password !== repeatedPassword) {
        setErrorMsg("Inconsistent passwords");
        return;
      }
      signup(username, password);
    }else{
      login(username, password);
    }
    if(username === "" || password === "") return setErrorMsg("Fill in both values");
  }
  let submitChangeUsername = (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let password = passwordInputRef.current?.value;
    let username = usernameInputRef.current?.value;

    if(password !== props.user?.password) {
      setErrorMsg("wrong password");
      return;
    }
    if(username === "" || password === "") return setErrorMsg("Fill in both values");
    let user = props.user?.clone();
    if(user){
      user.username = username ? username : "";
    }
    props.saveUserWithVal(user);
    setChangeUsernameToggle(false);
    setErrorMsg("");
  }
  let submitChangePassword = (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let oldPassword = passwordInputRef.current?.value;
    let newPassword = newPasswordInputRef.current?.value;
    let newPasswordRepeat = repeatedPasswordRef.current?.value;
    let username = usernameInputRef.current?.value;

    if(newPassword !== newPasswordRepeat) {
      setErrorMsg("Inconsistent password repeat");
      return;
    }

    if(oldPassword !== props.user?.password) {
      setErrorMsg("wrong password");
      return;
    }
    if(username === "" || oldPassword === "" || newPassword === "") return setErrorMsg("Fill in all values");
    let user = props.user?.clone();
    if(user && newPassword){
      user.password = newPassword;
    }
    props.saveUserWithVal(user);
    setChangePasswordToggle(false);
    setErrorMsg("");
  }

  const login = (username:string="",password:string="") => {
    reqLogin({
      username: username,
      password: password
    }).then((res:{error:string,success:boolean,user:User}) => {
      if(res.error){
        console.log("login error: ", res.error);
        return setErrorMsg(res.error);
      } else {
        setFormToggle(false);
        props.login(new User(res.user._id, res.user.username, res.user.password, res.user.tasks, res.user.tasksId, res.user.timeblocks, res.user.timeblocksId, res.user.templates, res.user.selectedTemplate));
        setLoggedIn(true);
      }
    }).catch((e:string)=>{
      console.log("login error: ", e);
    })
  }

  const signup = (username:string="",password:string="") => {
    reqSignup(username,password).then((res:{error:string,user:User})=>{
      if(res.error){
        if(res.error === "nonexistent username") return setErrorMsg("That username does not exist");
        if(res.error === "incorrect password") return setErrorMsg("Incorrect password");
        console.log("error: ", res.error);
      }
      else if (!res.error) {
        setFormToggle(false);
        if(res.user){
          login(res.user.username,res.user.password);
        }
      }
    })  
  }
  useEffect(()=>{
    // login("test", "hi");
    //eslint-disable-next-line
  },[])
  
  const useStyles = createUseStyles({
    container: {
      display:"flex",
      flexDirection:"column",
      alignItems: "center",
    }
  })
  
  const classes = useStyles();

  return (
    <div>
      {!formToggle && !changeUsernameToggle && !changePasswordToggle &&
        <div>
          {loggedIn &&
            <div className={classes.container}>
              <p style={{margin:"0"}}>Logged in as {props.user?.username}</p>
              <button onClick={() => setFormToggle(true)}>Login with different account</button>
              <button onClick={() => {setChangeUsernameToggle(true)}}>Change username</button>
              <button onClick={() => {setChangePasswordToggle(true)}}>Change password</button>
            </div>
          }
          {!loggedIn &&
          <button className="linkButton" onClick={() => setFormToggle(!formToggle)}><h2>{loggedIn?"Login with different account":"Login"}</h2></button>

          }
        </div>
      }
      {changeUsernameToggle &&
        <form onSubmit={submitChangeUsername} className="loginForm">
          <div className="loginRow">
            <h4><label>Password</label></h4>
            <input type="password" ref={passwordInputRef}></input>
          </div>

          <div className="loginRow">
            <h4><label>New username</label></h4>
            <input type="text" ref={usernameInputRef}></input>
          </div>
          {errorMsg!=="" &&
            <p style={{color:"red"}}>{errorMsg}</p>
          }
          <hr/>
          <input type="submit" value="Submit"/>
          <button
            type="button"
            onClick={()=>setChangeUsernameToggle(false)}
          >
            Cancel
          </button>
        </form>
      }
      {changePasswordToggle &&
        <form onSubmit={submitChangePassword} className="loginForm">
          <div className="loginRow">
            <h4><label>Old password</label></h4>
            <input type="oldPassword" ref={passwordInputRef}></input>
          </div>
          <div className="loginRow">
            <h4><label>New password</label></h4>
            <input type="newPassword" ref={newPasswordInputRef}></input>
          </div>
          {
            <div className="loginRow">
              <h4><label>Repeat password</label></h4>
              <input type="newPassword" ref={repeatedPasswordRef}></input>
            </div>
          }
          {errorMsg!=="" &&
            <p style={{color:"red"}}>{errorMsg}</p>
          }
          <hr/>
          <input type="submit" value="Submit"/>
          <button
            type="button"
            onClick={()=>setChangePasswordToggle(false)}
          >
            Cancel
          </button>
        </form>

      }
      {formToggle &&
        <form onSubmit={submit} className="loginForm">
          <div className="loginRow">
            <h4><label>Username</label></h4>
            <input type="text" ref={usernameInputRef}></input>
          </div>
          <hr/>
          <div className="loginRow">
            <h4><label>Password</label></h4>
            <input type="password" ref={passwordInputRef}></input>
          </div>
          {signupToggle &&
            <div className="loginRow">
              <h4><label>Repeat Password</label></h4>
              <input type="password" ref={repeatedPasswordRef}></input>
            </div>
          }
          {errorMsg!=="" &&
            <p style={{color:"red"}}>{errorMsg}</p>
          }
          <hr/>
          <input type="submit" value="Submit"/>
          <button
            type="button"
            onClick={()=>setSignupToggle(!signupToggle)}
          >
            {signupToggle?"Log in instead" : "Sign up instead"}
          </button>
          <button
            type="button"
            onClick={()=>setFormToggle(false)}
          >
            Cancel
          </button>
        </form>
      }
    </div>
  )
}