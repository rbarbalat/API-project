import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { thunkLoadEvents } from "../../store/events";
import {NavLink, useHistory} from "react-router-dom";
import { reformatTime } from "../../helpers";
import "./AllEvents.css";

export default function AllEvents()
{
    let events = useSelector(state => Object.values(state.events.allEvents));

    //events can be [], can't be undefined
    let upcomingEvents = events.filter(ele => new Date(ele.startDate).getTime() > new Date().getTime());
    let pastEvents = events.filter(ele => new Date(ele.startDate).getTime() < new Date().getTime());
    upcomingEvents.sort((a,b) => {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
    //most recent first, descending order
    pastEvents.sort((a,b) => {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

    events = [...upcomingEvents, ...pastEvents];

    const history = useHistory();
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(thunkLoadEvents());
    }, [dispatch])

    function onClick(e)
    {
        //the id is `eventBlock${ele.id}` and groupBlock is 10 chars long
        //slice(10) starts at INDEX 10
        const eventId = e.currentTarget.id.slice(10);
        history.push(`/events/${eventId}`);
    }

    if(events.length === 0) return <div> All Events Page Loading</div>
    return (
        <>
            <div className="allEventsHeader">
                <div className="EventsGroupsContainer">
                    <span id="EventsSpan">Events</span>
                    <NavLink id="linkToGroupsFromEvents" to="/groups">Groups</NavLink>
                </div>
                <div id="eventsInMeetup">Events on FourLegsGood</div>
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
                                        <span>{` ${reformatTime(ele.startDate)}`}</span>
                                    </div>
                                    <div className="eventName">{ele.name}</div>
                                    <div className="eventLocation">{ele.Venue !== null ? `${ele.Venue.city}, ${ele.Venue.state}` : `Denver, CO`}</div>
                                </div>
                            </div>

                            <div className="eventBlockBottomDescription">
                                {ele.description}
                            </div>

                        </div>
                    ))
                }
            </div>
            <div className="all_events_bottom_space"></div>
        </>
    )
}
