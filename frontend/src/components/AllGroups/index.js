import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { thunkLoadGroups } from "../../store/groups.js"
import {NavLink, useHistory} from "react-router-dom";
import "./AllGroups.css";

export default function AllGroups()
{
    //can do obj.values right away b/c allGroups initial state {}, can't be undefined
    const groups = useSelector(state => Object.values(state.groups.allGroups));
    const history = useHistory();
    const dispatch = useDispatch();
    // const [neverLoaded, setNeverLoaded] = useState(true);
    // console.log("neverLoaded -----  ", neverLoaded);
    useEffect(() => {
        //dispatch if groups empty but problem is you create a group before
        //ever loading, now won't load the remaining groups unless you delete
        dispatch(thunkLoadGroups());
    }, [dispatch])

    function onClick(event)
    {
        //clicking anywhere on the div that has details for groupId links to the group details page
        //the id is `groupBlock${ele.id}` and groupBlock is 10 chars long
        //slice(10) starts at INDEX 10
        const groupId = event.currentTarget.id.slice(10);
        history.push(`/groups/${groupId}`);
    }

    if(groups === undefined) return <div> All Groups Page Loading</div>
    return (
        <>
            <div className="allGroupsHeader">
                <div className="EventsGroupsContainer">
                    <NavLink id="EventsNavLink" to ="/events">Events</NavLink>
                    <span id="GroupsSpan">Groups</span>
                </div>
                <div id="groupsInMeetUp">Groups in Meetup</div>
            </div>
            <div className="allGroupsContainer">
                {
                    groups.map(ele => (
                        <div id={`groupBlock${ele.id}`} className="groupBlock" onClick={onClick} key={`group${ele.id}`}>
                            <div className="groupImageContainer">
                                <img alt="alt" className="allGroupImages" src={ele.previewImage}></img>
                            </div>

                            <div className="groupInfoContainer">
                                <div>
                                    <div>{ele.name}</div>
                                    <div>{`${ele.city}, ${ele.state}`}</div>
                                </div>
                                <div>{ele.about}</div>
                                <div className="numType">
                                    {/* <div>### events</div>
                                    <div>Public or Private</div> */}
                                    <div className="numTypeLeft">{`${ele.numMembers} Members`}</div>
                                    {/* change this asterisk to a dot later */}
                                    <div className="numTypeCenter">&bull;</div>
                                    <div>{ele.private ? "Private" : "Public"}</div>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
        </>
    )
}
