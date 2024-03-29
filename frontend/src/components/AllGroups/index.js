import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { thunkLoadGroups } from "../../store/groups.js"
import {NavLink, useHistory} from "react-router-dom";
import "./AllGroups.css";

export default function AllGroups()
{
    // {} is the initial state of allGroups
    const groups = useSelector(state => Object.values(state.groups.allGroups));
    const history = useHistory();
    const dispatch = useDispatch();
    // const [loaded, setLoaded] = useState(false);
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

    // groups is an empty array before the useEffect runs
    // maybe change this to depend on if the thunk returned a good response
    if(groups.length === 0) return <div> All Groups Page Loading</div>
    return (
        <>
            <div className="allGroupsHeader">
                <div className="EventsGroupsContainer">
                    <NavLink id="EventsNavLink" to ="/events">Events</NavLink>
                    <span id="GroupsSpan">Groups</span>
                </div>
                <div id="groupsInMeetUp">Groups on FourLegsGood</div>
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
                                    <div className="groupName">{ele.name}</div>
                                    <div className="groupLocation">{`${ele.city}, ${ele.state}`}</div>
                                </div>

                                <div className="groupAbout">{ele.about}</div>

                                <div className="groupInfoBottom">
                                    <span className="numMembersAllGroups">{`${ele.numMembers === 0 ? 1 : ele.numMembers} Member(s)`}</span>
                                    <span className="dotAllGroups">&bull;</span>
                                    <span className="typeAllGroups">{ele.private ? "Private" : "Public"}</span>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
            <div className="all_groups_bottom_space"></div>
        </>
    )
}
