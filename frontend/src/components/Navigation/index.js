import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import ProfileButton from "./ProfileButton";
import OpenModalButton from "../OpenModalButton";
import LoginFormModal from "../LoginFormModal";
import SignupFormModal from "../SignupFormModal";
import "./Navigation.css";

//current
function Navigation({ isLoaded }) {
  const sessionUser = useSelector((state) => state.session.user);

  let sessionLinks;
  if (sessionUser) {
    sessionLinks = (
      <div className=".headerRightProfile">
        <ProfileButton user={sessionUser} />
      </div>
    );
  } else {
    sessionLinks = (
      <div className="headerRight">
        <OpenModalButton
          id="login"
          buttonText="Log In"
          modalComponent={<LoginFormModal />}
        />
        <OpenModalButton
          id="signup"
          buttonText="Sign Up"
          modalComponent={<SignupFormModal />}
        />
      </div>
    );
  }

  return (
    <div className="header">
      <div>
        <NavLink id="MeetUp" exact to="/">
          MeetUp
        </NavLink>
      </div>
        {isLoaded && sessionLinks}
    </div>

    // <ul>
    //   <li>
    //     <NavLink exact to="/">
    //       Home
    //     </NavLink>
    //   </li>
    //   {isLoaded && sessionLinks}
    // </ul>
  );
}

export default Navigation;
