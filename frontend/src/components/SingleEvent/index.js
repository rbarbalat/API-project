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
        <NavLink to="/events"></NavLink>

        <div>{event.name}</div>
        <div>Hosted by {group.Organizer.firstName} {group.Organizer.lastName}</div>
        <div>
            <div>
                {/* might need to put this img inside a div */}
                <img alt="alt" src={event.EventImages[0].url}></img>
                <div>
                    <div>
                        <img alt="alt" src={group.GroupImages[0].url}></img>
                        <div>{group.name} and {group.private}</div>
                    </div>
                    <div>
                        <div>
                            <i class="fa-regular fa-clock"></i>
                            <div>{event.startDate}</div>
                            <div>{event.endDate}</div>
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
                    </div>
                </div>
            </div>
            <div>
                {event.description}
            </div>

            {showButtons && buttons}
        </div>
        </>
    )
}
