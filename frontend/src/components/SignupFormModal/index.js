import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import * as sessionActions from "../../store/session";
import "./SignupForm.css";

//current
function SignupFormModal() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === confirmPassword) {
      setErrors({});
      return dispatch(
        sessionActions.signup({
          email,
          username,
          firstName,
          lastName,
          password,
        })
      )
        .then(closeModal)
        .catch(async (res) => {
          const data = await res.json();
          if (data && data.errors) {
            setErrors(data.errors);
          }
        });
    }
    return setErrors({
      confirmPassword: "Confirm Password field must be the same as the Password field"
    });
  };

  useEffect(() => {
    username.length < 4 || password.length < 6 ||
    password !== confirmPassword || email.length < 1 ||
    firstName.length < 1 || lastName.length < 1
    ?
    setDisabled(true) : setDisabled(false)
  }, [email, username, firstName, lastName, password, confirmPassword])

  return (
    <>
      <span id="signupSpan">Sign Up</span>
      <form onSubmit={handleSubmit}>
        <div id="signupInputs">
        {errors.email && <div className="signupErrors">{errors.email}</div>}
        {errors.username && <div className="signupErrors">{errors.username}</div>}
        {errors.firstName && <div className="signupErrors">{errors.firstName}</div>}
        {errors.lastName && <div className="signupErrors">{errors.lastName}</div>}
        {errors.password && <div className="signupErrors">{errors.password}</div>}
          <input
            type="text"
            value={email}
            placeholder={email.length > 0 ? "" : "Email"}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        {/* {errors.email && <div className="signupErrors">{errors.email}</div>} */}
          <input
            type="text"
            value={username}
            placeholder={username.length > 0 ? "" : "Username"}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        {/* {errors.username && <div className="signupErrors">{errors.username}</div>} */}
          <input
            type="text"
            value={firstName}
            placeholder={firstName.length > 0 ? "" : "First Name"}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        {/* {errors.firstName && <div className="signupErrors">{errors.firstName}</div>} */}
          <input
            type="text"
            value={lastName}
            placeholder={lastName.length > 0 ? "" : "Last Name"}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        {/* {errors.lastName && <div className="signupErrors">{errors.lastName}</div>} */}
          <input
            type="password"
            value={password}
            placeholder={password.length > 0 ? "" : "Password"}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        {/* {errors.password && <div className="signupErrors">{errors.password}</div>} */}
          <input
            type="password"
            value={confirmPassword}
            placeholder={confirmPassword.length > 0 ? "" : "Confirm Password"}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        {errors.confirmPassword && (
          <div className="signupErrors">{errors.confirmPassword}</div>
        )}
        <button id="signUpButton" className={disabled ? "disabled" : "enabled"} type="submit" disabled={disabled}>Sign Up</button>
        </div>
      </form>
    </>
  );
}

export default SignupFormModal;
