import {User} from './classes'

export const reqUpdateUser = async (user:User): Promise<any> => {
  let fetchObj = {
    method: 'POST',
    body: JSON.stringify(user.toObj()),
    headers: {"Content-Type": "application/json"}
  }

  const res = await fetch(
    process.env.NODE_ENV === "development" ?
    `http://localhost:3001/updateUser` :
    `https://deepworkrun.herokuapp.com/updateUser`,
    fetchObj
  );

  return res.json();
}

export const reqSignup = async (username:string, password:string): Promise<any> => {
  let newUser:User = await User.new(username, password).then((user:User) => user);
  let fetchObj = {
    method: 'POST',
    body: JSON.stringify(newUser.toObj()),
    headers: {"Content-Type": "application/json"}
  }

  const res = await fetch(
    process.env.NODE_ENV === "development" ?
    `http://localhost:3001/signup` :
    `https://deepworkrun.herokuapp.com/signup`,
    fetchObj
  );

  return res.json();
}

export const reqLogin = async (body:{"username":string,"password":string}): Promise<any> => {
  let fetchObj = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {"Content-Type": "application/json"}
  }

  const res = await fetch(
    process.env.NODE_ENV === "development" ?
    `http://localhost:3001/login` :
    `https://deepworkrun.herokuapp.com/login`,
    fetchObj
  );

  return res.json();
} 