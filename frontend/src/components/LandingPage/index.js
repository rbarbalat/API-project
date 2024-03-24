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
        <>
            <div className="landingWrapper">

                <div className="sectionOne">
                    <div className="titleIntroText">
                        <div>
                            <div className="bigTitle">The animal network</div>
                            <div className="bigTitle">Where interests</div>
                            <div className="bigTitle">become friendships</div>
                        </div>
                        <div className="landingIntroText">
                                Whatever your interest, from chewing on shoes and drinking from the toilet bowl to running around and barking there are thousands who share it on FourLegsGood.
                        </div>
                    </div>
                    <img className="infographic" src="https://upload.wikimedia.org/wikipedia/commons/9/9b/Social_Network_Analysis_Visualization.png" alt="infographic"></img>
                </div>

                <div className="sectionTwo">
                    <span className="landingSubTitle">How FourLegsGood works</span>
                    <span className="landingCaption">Our basic idea is TwoLegsBad.</span>
                    <span className="landingCaption">Everything follows from that.</span>
                </div>

                <div className="sectionThree">

                    <div className="sectionThreePart">

                        <img className = "sectionThreeImage" alt="German Shepherd"
                            src="https://upload.wikimedia.org/wikipedia/commons/d/d0/German_Shepherd_-_DSC_0346_%2810096362833%29.jpg">
                        </img>

                        <NavLink className="nL" exact to="/groups">See all groups</NavLink>

                        <span className="sectionThreeText">
                            There is almost a group for everything!  Easy to find it here.
                        </span>

                    </div>

                    <div className="sectionThreePart">

                        <img className = "sectionThreeImage" alt="Labrador Retriever"
                            src="https://upload.wikimedia.org/wikipedia/commons/3/34/Labrador_on_Quantock_%282175262184%29.jpg">
                        </img>

                        <NavLink className="nL" exact to="/events">Find an event</NavLink>

                        <span className="sectionThreeText">
                            No matter where you are we have an event for you.
                        </span>

                    </div>

                    <div className="sectionThreePart">

                        <img className="sectionThreeImage" alt="Golden Retriever"
                            src="https://upload.wikimedia.org/wikipedia/commons/a/aa/FTCB181207.jpg">
                        </img>

                        {
                            sessionUser ?
                            <NavLink className="nL" exact to="/groups/new">Start a new group</NavLink>
                            :
                            <span className="disabledNavLink">Start a new group</span>
                        }


                        <span className="sectionThreeText">
                            The organizers are the ones who make this place work!
                        </span>

                    </div>

                </div>

                <div className="sectionFour">
                    {!sessionUser && signUpButton}
                </div>

            </div>

            <div className="landing_page_bottom_space"></div>
        </>
    )
}
