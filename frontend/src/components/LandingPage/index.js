import {NavLink} from "react-router-dom";
import { useSelector } from "react-redux";
import OpenModalButton from "../OpenModalButton";
import SignupFormModal from "../SignupFormModal";
import "./LandingPage.css";

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
            <div className="landingWrapper">

                <div className="sectionOne">
                    <div className="titleIntroText">
                        {/* maybe 3 divs here for 3 lines? */}
                        <div className="landingTitle">
                            The animal platform-- Where interests
                            become friendships
                        </div>
                        <div className="landingIntroText">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat
                        </div>
                    </div>
                    <div className="infographicWrapper">
                        <img className="infographic" src="https://upload.wikimedia.org/wikipedia/commons/3/3f/Walking_tiger_female.jpg"alt="infographic"></img>
                    </div>
                </div>

                <div className="sectionTwo">
                    <div className="landingSubtitle">How meetup works</div>
                    <div className="landingCaption">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, se
                    </div>
                </div>

                <div className="sectionThree">

                    <div className="sectionThreePart">
                        <div className="sectionThreeImage">
                            <img alt="alt" src="https://upload.wikimedia.org/wikipedia/commons/3/3f/Walking_tiger_female.jpg"></img>
                        </div>
                        <div className="sectionThreeLink">
                            <NavLink className="nL" exact to="/groups">See all groups</NavLink>
                        </div>
                        <div>
                            <div className="sectionThreeText">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, se
                            </div>
                        </div>
                    </div>

                    <div className="sectionThreePart">
                        <div className="sectionThreeImage">
                            <img alt="alt" src="https://upload.wikimedia.org/wikipedia/commons/3/3f/Walking_tiger_female.jpg"></img>
                        </div>
                        <div className="sectionThreeLink">
                            <NavLink className="nL" exact to="/events">Find an event</NavLink>
                        </div>
                        <div>
                            <div className="sectionThreeText">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, se
                            </div>
                        </div>
                    </div>

                    <div className="sectionThreePart">
                        <div className="sectionThreeImage">
                            <img alt="alt" src="https://upload.wikimedia.org/wikipedia/commons/3/3f/Walking_tiger_female.jpg"></img>
                        </div>
                        <div className="sectionThreeLink">
                            <NavLink className="nL" exact to="/groups/new">Start a new group</NavLink>
                        </div>
                        <div>
                            <div className="sectionThreeText">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, se
                            </div>
                        </div>
                    </div>

                </div>

                <div className="sectionFour">
                    {!sessionUser && signUpButton}
                </div>

            </div>
    )
}
