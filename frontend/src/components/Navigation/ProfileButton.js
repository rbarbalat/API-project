import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from 'react-redux';
import { useHistory } from "react-router-dom";
import * as sessionActions from '../../store/session';
import OpenModalMenuItem from './OpenModalMenuItem';
import LoginFormModal from '../LoginFormModal';
import SignupFormModal from '../SignupFormModal';
import "./ProfileButton.css";

function ProfileButton({ user }) {
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const ulRef = useRef();

  const history = useHistory();

  const openMenu = () => {
    if (showMenu) return;
    setShowMenu(true);
  };

  useEffect(() => {
    if (!showMenu) return;

    const closeMenu = (e) => {
      if (!ulRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', closeMenu);

    return () => document.removeEventListener("click", closeMenu);
  }, [showMenu]);

  const closeMenu = () => setShowMenu(false);

  const logout = (e) => {
    e.preventDefault();
    dispatch(sessionActions.logout());
    history.replace("/");
    closeMenu();
  };

  function viewGroups()
  {
    return history.push("/groups");
  }
  function viewEvents()
  {
    return history.push("/events");
  }

  const ulClassName = "profile-dropdown" + (showMenu ? "" : " hidden");
  const arrowDown = "fa-solid fa-arrow-down";
  const arrowUp = "fa-solid fa-arrow-up";

  return (
    <>
      <button id="containsFavicon" onClick={openMenu}>
        <i className="fa-solid fa-user"></i>
      </button>

      <i id="arrow" className={showMenu ? arrowUp : arrowDown}></i>

      <ul className={ulClassName} ref={ulRef}>
        {/* hard to see ternary here, displays either dropdown menu or login/signup */}
        {user ? (
          <>
            <li>Hello, {user.firstName}</li>
            <li>{user.email}</li>
            <li>
              <button onClick ={viewGroups}>View Groups</button>
            </li>
            <li>
              <button onClick={viewEvents}>View Events</button>
            </li>
            <li id="containsButton">
              <button onClick={logout}>Log Out</button>
            </li>
          </>
        ) : (
          <>
            <OpenModalMenuItem
              itemText="Log In"
              onItemClick={closeMenu}
              modalComponent={<LoginFormModal />}
            />
            <OpenModalMenuItem
              itemText="Sign Up"
              onItemClick={closeMenu}
              modalComponent={<SignupFormModal />}
            />
          </>
        )}
      </ul>
    </>
  );
}

export default ProfileButton;
