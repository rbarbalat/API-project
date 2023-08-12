import { useEffect } from "react";
import { useParams, NavLink, useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { thunkLoadSingleEvent } from "../../store/events.js";
import OpenModalButton from "../OpenModalButton/index.js";
import DeleteModal from "../DeleteModal/index.js";
import { thunkLoadSingleGroup } from "../../store/groups.js";
import { reformatTime } from "../../helpers";
import VenueCard from "../VenueCard/index.js";
import "./SingleEvent.css";

export default function SingleEvent()
{
    const event = useSelector(state => state.events.singleEvent);
    const eventIsNotEmpty = Object.keys(event).length !== 0;
    const { eventId } = useParams();

    let groupId;
    if(eventIsNotEmpty) groupId = event.Group.id;

    const sessionUser = useSelector((state) => state.session.user);
    const group = useSelector(state => state.groups.singleGroup);
    const groupIsNotEmpty = Object.keys(group).length !== 0;

    let startDate;
    if(event.startDate) startDate = new Date(new Date(event.startDate).toString() + "UTC").toISOString();
    console.log("event.startDate ", event?.startDate)
    console.log("startDate ", startDate);

    let endDate;
    if(event.endDate) endDate = new Date(new Date(event.endDate).toString() + "UTC").toISOString();
    // console.log("endDate ", endDate);

    let userIsOrganizer;
    if(groupIsNotEmpty && sessionUser)
    {
        group.organizerId === sessionUser.id ?
        userIsOrganizer = true : userIsOrganizer = false;
    }
    let showButtons = false;
    if(userIsOrganizer) showButtons = true;


    function featureComingSoon()
    {
        return window.alert("Feature Coming Soon");
    }
    const buttons = (
        <div className="manageEventButtons">
            <button onClick={featureComingSoon}>Update</button>
            <OpenModalButton id="deleteEvent" buttonText="Delete"
                modalComponent={<DeleteModal typeId={eventId} type="event" eventGroupId={groupId}/>}/>
        </div>
    )

    const history = useHistory();
    const dispatch = useDispatch();
    useEffect(() => {
        //on a refresh or first render event will be {} and event.id is undefined
        //so the if block is entered
        if(Number(eventId) !== event.id)
        {
            dispatch(thunkLoadSingleEvent(eventId));
        }
        //groupId is pulled from the event object, undef on a refresh // first render
        if(groupId !== undefined) dispatch(thunkLoadSingleGroup(groupId));
    }, [dispatch, eventId, groupId])

    if( eventIsNotEmpty === false || groupIsNotEmpty === false) return <div>loading</div>
    return (
        <>
    {/* <div className="testBackGround"> */}
        <div className='singleEventHeader'>
            <div>
                <i id="singleEventLessThanSign" className="fa-light fa-less-than"></i>
                <NavLink id="singleEventLinkToEvents" to="/events">Events</NavLink>
            </div>
            <div id="singleEventName">{event.name}</div>
            <div id="singleEventHost">Hosted by {group.Organizer.firstName} {group.Organizer.lastName}</div>
        </div>

<div className="backGroundSingleEvent">

        <div className="middleSingleEvent">
                <div className="eventImage">
                    <img id="eventImagePic" alt="alt" src={event.EventImages[0].url}></img>
                </div>
                <div className="rightSection">
                    <div className="rightTop">
                        <div className="groupImage"><img id="groupImagePic" alt="alt" src={group.GroupImages[0].url}></img></div>
                        {/* <img id="groupImagePic" alt="alt" src={group.GroupImages[0].url}></img> */}
                        <div className="groupInfoOnSingleEvent">
                            <div>{group.name}</div>
                            <div id="singleEventPrivate">Private</div>
                        </div>
                    </div>
                    <div className="rightBottom">
                        <div className="dateTimeSectionSingleEvent">
                            <i className="fa-regular fa-clock"></i>
                            <div>
                                <div>START {startDate.slice(0,10)} &bull; {reformatTime(startDate)}</div>
                                <div>END&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{endDate.slice(0,10)} &bull; {reformatTime(endDate)}</div>
                                {/* <div>START {event.startDate.slice(0,10)} &bull; {reformatTime(event.startDate)}</div>
                                <div>END&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{event.endDate.slice(0,10)} &bull; {reformatTime(event.endDate)}</div> */}
                            </div>
                        </div>
                    {
                        event.Venue ?
                        <div className="single_event_venue_wrapper">
                            <i class="fa-solid fa-location-pin"></i>
                            <div className="single_event_venue_details">
                                {event.Venue.address}, {event.Venue.city}, {event.Venue.state}
                            </div>
                        </div>
                        :
                        <div className="single_event_venue_wrapper">
                            <i className="fa-solid fa-location-pin"></i>
                            <div className="single_event_venue_details">
                                Location To Be Determined
                            </div>
                        </div>
                    }
                        <div className="priceSectionSingleEvent">
                            <i className="fa-solid fa-dollar-sign"></i>
                            <div>{event.price === 0 ? "FREE" : event.price}</div>
                        </div>
                        <div className ="typeSectionSingleEvent">
                            <div>
                                <i className="fa-solid fa-map-pin"></i>
                                <span>{event.type}</span>
                            </div>
                            {showButtons && buttons}
                        </div>
                        {/* {showButtons && buttons} */}
                    </div>
                </div>
        </div>

        <div id="singleEventDetails">Details</div>
        {/* <div className="description">{event.description}</div> */}
        <div className="description"> {event.description} </div>
</div>
        </>
    )
}
