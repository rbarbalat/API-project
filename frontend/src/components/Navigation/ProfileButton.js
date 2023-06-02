import React, { useState } from "react";
import { useDispatch } from 'react-redux';
import * as sessionActions from '../../store/session';

function ProfileButton({ user }) {
  const dispatch = useDispatch();

  const logout = (e) => {
    e.preventDefault();
    dispatch(sessionActions.logout());
  };

  const ulClassName = "profile-dropdown";

  return (
    <>
      <button>
        <i className="fa-solid fa-user" />
        {/* <i className="fas fa-user-circle" /> */}
      </button>
      <ul className="profile-dropdown">
        <li>{user.username}</li>
        <li>{user.firstName} {user.lastName}</li>
        <li>{user.email}</li>
        {/* extra button? there is already one inside the li that contains ProfileButton */}
        {/* <li>
          <button onClick={logout}>Log Out</button>
        </li> */}
      </ul>
    </>
  );
}

export default ProfileButton;
