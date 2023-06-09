import { useEffect } from "react";
import { useParams, NavLink, useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { thunkLoadSingleEvent } from "../../store/events.js";
//import { thunkDeleteGroup } from "../../store/groups.js";
import "./SingleEvent.css";
import OpenModalButton from "../OpenModalButton/index.js";
import DeleteModal from "../DeleteModal/index.js";
import { thunkLoadSingleGroup } from "../../store/groups.js";

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

    let userIsOrganizer;
    if(groupIsNotEmpty && sessionUser)
    {
        group.organizerId === sessionUser.id ?
        userIsOrganizer = true : userIsOrganizer = false;
    }
    let showButtons = false;
    if(userIsOrganizer) showButtons = true;
    const buttons = (
        <div>
            <button>Update</button>
            <OpenModalButton id="deleteEvent" buttonText="Delete"
                modalComponent={<DeleteModal typeId={eventId} type="event" eventGroupId={groupId}/>}/>
        </div>
    )

    const history = useHistory();
    const dispatch = useDispatch();
    useEffect(() => {
        if(Number(eventId) !== event.id)
        {
            dispatch(thunkLoadSingleEvent(eventId));
        }
        if(groupId !== undefined) dispatch(thunkLoadSingleGroup(groupId));
    }, [dispatch, eventId, groupId])

    if( eventIsNotEmpty === false || groupIsNotEmpty === false) return <div>loading</div>
    return (
        <>
        <div className='singleEventHeader'>
            <NavLink id="singleEventLinkToEvents" to="/events">Events</NavLink>
            <div id="singleEventName">{event.name}</div>
            <div id="singleEventHost">Hosted by {group.Organizer.firstName} {group.Organizer.lastName}</div>
        </div>

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
                            <i class="fa-regular fa-clock"></i>
                            <div>
                                <div>Start {event.startDate.slice(0,10)} &bull;</div>
                                <div>End {event.endDate.slice(0,10)} &bull;</div>
                            </div>
                        </div>
                        <div>
                            <i class="fa-solid fa-dollar-sign"></i>
                            <div>{event.price}</div>
                        </div>
                        <div>
                            {/* map pins aren't display */}
                            <i class="fa-sharp fa-light fa-map-pin"></i>
                            <div>{event.type}</div>
                        </div>
                        {showButtons && buttons}
                    </div>
                </div>
        </div>

        {/* <div className="description">{event.description}</div> */}
        <div className="description">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</div>
        </>
    )
}
