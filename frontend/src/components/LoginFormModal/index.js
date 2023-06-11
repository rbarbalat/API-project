// frontend/src/components/LoginFormModal/index.js
import React, { useState, useEffect } from "react";
import * as sessionActions from "../../store/session";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import "./LoginForm.css";
//require('dotenv').config();

//current
function LoginFormModal() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [disabled, setDisabled] = useState(true);
  const { closeModal } = useModal();

  //sessionActions is all exports from /store/session in an object
  //.login is the login thunk
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    return dispatch(sessionActions.login({ credential, password }))
      .then(closeModal)
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) {
          setErrors(data.errors);
        }
      });
  };

  function onClick(event)
  {
    event.preventDefault();
    setErrors({});
    //console.log(process.env.DEMO_CREDENTIAL);
    return dispatch(sessionActions.login({
      credential: process.env.REACT_APP_CREDENTIAL,
      password: process.env.REACT_APP_PASSWORD
    }))
    .then(closeModal)
  }

  useEffect(() => {
    if(credential.length < 4 || password.length < 6) setDisabled(true);
    else setDisabled(false);
  }, [credential, password])

  return (
    <>
    {/* this thing is inside the div#modal-content in Modal.js, style in modal.css */}
      <span id="loginSpan">Log In</span>
      <form onSubmit={handleSubmit}>
        <div id="loginInputs">
            {
              errors.credential &&
              (<div id="credError">{errors.credential}</div>)
            }
          <input
            type="text"
            id="credentialInput"
            placeholder={credential.length > 0 ? "" : "Username"}
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
          />
          <input
            type="password"
            id="passwordInput"
            placeholder={password.length > 0 ? "" : "Password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        <button id="loginButton" className={disabled ? "disabled" : "enabled"} type="submit" disabled={disabled}>Log In</button>

        </div>
      </form>

      <button id="demoUser" onClick={onClick}>Demo User</button>
    </>
  );
}

export default LoginFormModal;
