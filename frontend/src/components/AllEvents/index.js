import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { thunkLoadEvents } from "../../store/events";
import {NavLink, useHistory} from "react-router-dom";
import "./AllEvents.css";

export default function AllEvents()
{
    //can do obj.values right away b/c allGroups initial state {}, can't be undefined
    let events = useSelector(state => Object.values(state.events.allEvents));
    events.sort((a,b) => {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
    //also need to separate into past and future

    const history = useHistory();
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(thunkLoadEvents());
    }, [dispatch])

    function onClick(e)
    {
        //clicking anywhere on the div that has details for groupId links to the group details page
        //the id is `eventBlock${ele.id}` and groupBlock is 10 chars long
        //slice(10) starts at INDEX 10
        const eventId = e.currentTarget.id.slice(10);
        history.push(`/events/${eventId}`);
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
                    events.map(ele => (
                        <div id={`eventBlock${ele.id}`} className="eventBlock" onClick={onClick} key={`event${ele.id}`}>
                            <div className="eventBlockTop">
                                <div className="eventImageContainer">
                                    <img className="allEventImages" alt="alt" src={ele.previewImage}></img>
                                </div>

                                <div className="eventInfoContainer">
                                    <div>{`Starts on ${ele.startDate.slice(0,10)} `} &bull;  {` ${ele.startDate.slice(10)}`}</div>
                                    <div>{ele.name}</div>
                                    {/* add seeder data to get rid of null venues */}
                                    <div>{ele.Venue !== null && `${ele.Venue.city}, ${ele.Venue.state}`}</div>
                                </div>
                            </div>

                            <div>
                                {ele.description}
                            </div>
                        </div>
                    ))
                }
            </div>
        </>
    )
}
