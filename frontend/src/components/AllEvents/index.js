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
                    <span id="EventsSpan">Events</span>
                    <NavLink id="linkToGroupsFromEvents" to="/groups">Groups</NavLink>
                </div>
                <div id="eventsInMeetup">Events in Meetup</div>
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
                                    <div className="EventDateTime">
                                        <span>{`${ele.startDate.slice(0,10)} `}</span>
                                        <span>&bull;</span>
                                        <span>{` ${ele.startDate.slice(10)}`}</span>
                                    </div>
                                    <div className="eventName">{ele.name}</div>
                                    <div className="eventLocation">{ele.Venue !== null ? `${ele.Venue.city}, ${ele.Venue.state}` : `Denver, CO`}</div>
                                </div>
                            </div>

                            <div className="eventBlockBottomDescription">
                                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugi
                            </div>

                        </div>
                    ))
                }
            </div>
        </>
    )
}
