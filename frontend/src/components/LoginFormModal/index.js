// frontend/src/components/LoginFormModal/index.js
import React, { useState, useEffect } from "react";
import * as sessionActions from "../../store/session";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import "./LoginForm.css";

//current
function LoginFormModal() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [disabled, setDisabled] = useState(true);
  const { closeModal } = useModal();

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
            Placeholder={credential.length > 0 ? "" : "username"}
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
          />
          <input
            type="password"
            Placeholder={password.length > 0 ? "" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        <button id="loginButton" type="submit" disabled={disabled}>Log In</button>
        <button id="demoUser">Demo User</button>

        </div>
      </form>
    </>
  );
}

export default LoginFormModal;
