import {NavLink} from "react-router-dom";
import { useSelector } from "react-redux";
import OpenModalButton from "../OpenModalButton";
import SignupFormModal from "../SignupFormModal";

export default function LandingPage()
{
    const sessionUser = useSelector((state) => state.session.user);
    const signUpButton = (
        <div>
            <OpenModalButton id="signup" buttonText="Sign Up"
                modalComponent={<SignupFormModal/>} />
        </div>
                        );
    return (
        <>
            <div>LANDING PAGE!</div>
            <NavLink exact to ="/groups">See all groups</NavLink>
            <div>some space</div>
            <NavLink exact to ="/groups/new">Create Group Test</NavLink>
            {!sessionUser && signUpButton}
        </>
    )
}
