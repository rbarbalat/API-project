import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { thunkLoadGroups } from "../../store/groups.js"
import {NavLink, useHistory} from "react-router-dom";
import "./AllEvents.css";

export default function AllEvents()
{
    //can do obj.values right away b/c allGroups initial state {}, can't be undefined
    const events = useSelector(state => Object.values(state.groups.allEvents));
    const history = useHistory();
    const dispatch = useDispatch();
    const [neverLoaded, setNeverLoaded] = useState(true);
    //console.log("neverLoaded -----  ", neverLoaded);
    useEffect(() => {
        //dispatch(thunkLoadEvents());
    }, [dispatch])

    function onClick(e)
    {
        //clicking anywhere on the div that has details for groupId links to the group details page
        //the id is `eventBlock${ele.id}` and groupBlock is 10 chars long
        //slice(10) starts at INDEX 10
        const eventId = e.currentTarget.id.slice(10);
        history.push(`/groups/${groupId}`);
    }

    if(events === undefined) return <div> All Events Page Loading</div>
    return (
        <>
            <div className="allEventsHeader">
                <div className="EventsGroupsContainer">
                    <NavLink id="EventsNavLink" to ="/">
                        Events
                    </NavLink>
                    <NavLink to="/groups">
                        Groups
                    </NavLink>
                </div>
                <div>
                    Events in Meetup
                </div>
            </div>
            <div className="allEventsContainer">
                {
                    groups.map(ele => (
                        <div id={`eventBlock${ele.id}`} className="eventBlock" onClick={onClick} key={`event${ele.id}`}>
                            <div className="groupImageContainer">
                                <img alt="alt" src={ele.previewImage}></img>
                            </div>

                            <div>
                                <div>{ele.name}</div>
                                <div>{`${ele.city}, ${ele.state}`}</div>
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
            {/* <ul>
                {
                    groups.map(ele => (
                        <li key={ele.id}>
                          {ele.id} --- {ele.name} ----- {ele.about}
                        </li>
                    ))
                }
            </ul> */}
        </>
    )
}
