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
            <OpenModalButton id="signUpLanding" buttonText="Join FourLegsGood"
                modalComponent={<SignupFormModal/>} />
        </div>
                        );
    return (
            <div className="landingWrapper">

                <div className="sectionOne">
                    <div className="titleIntroText">
                        <div>
                            <div className="bigTitle">The animal platform</div>
                            <div className="bigTitle">Where interests</div>
                            <div className="bigTitle">become friendships</div>
                        </div>
                        <div className="landingIntroText">
                                Whatever your interest, from chewing on shoes and drinking from the toilet bowl to running around and barking there are thousands who share it on DogUp.
                        </div>
                    </div>
                    <div className="infographicWrapper">
                        <img className="infographic" src="https://upload.wikimedia.org/wikipedia/commons/9/9b/Social_Network_Analysis_Visualization.png" alt="infographic"></img>
                    </div>
                </div>

                <div className="sectionTwo">
                    <div className="landingSubTitle">How FourLegsGood works</div>
                    <div className="landingCaption">Our basic idea is TwoLegsBad.</div>
                    <div className="landingCaption">Everything follows from that.</div>
                </div>

                <div className="sectionThree">

                    <div className="sectionThreePart">
                        <div className="sectionThreeImage">
                            <img alt="alt" src="https://upload.wikimedia.org/wikipedia/commons/d/d0/German_Shepherd_-_DSC_0346_%2810096362833%29.jpg"></img>
                        </div>
                        <div className="sectionThreeLink">
                            <NavLink className="nL" exact to="/groups">See all groups</NavLink>
                        </div>
                        <div>
                            <div className="sectionThreeText">
                                There is almost a group for everything!  And it is easy to find it here.
                            </div>
                        </div>
                    </div>

                    <div className="sectionThreePart">
                        <div className="sectionThreeImage">
                            <img alt="alt" src="https://upload.wikimedia.org/wikipedia/commons/b/bd/Golden_Retriever_Dukedestiny01_drvd.jpg"></img>
                        </div>
                        <div className="sectionThreeLink">
                            <NavLink className="nL" exact to="/events">Find an event</NavLink>
                        </div>
                        <div>
                            <div className="sectionThreeText">
                                No matter the location, date or time we have something for you.
                            </div>
                        </div>
                    </div>

                    <div className="sectionThreePart">
                        <div className="sectionThreeImage">
                            <img alt="alt" src="https://upload.wikimedia.org/wikipedia/commons/1/18/Samojed00.jpg"></img>
                        </div>
                        <div className="sectionThreeLink">
                        {
                            sessionUser ?
                            <NavLink className="nL" exact to="/groups/new">Start a new group</NavLink>
                            :
                            <span className="disabledNavLink">Start a new group</span>
                        }
                        </div>
                        <div>
                            <div className="sectionThreeText">
                                The organizers are the ones who make this place work!
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
