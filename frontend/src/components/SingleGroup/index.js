import { useEffect } from "react";
import { useParams, NavLink, useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { thunkLoadSingleGroup } from "../../store/groups.js";
import { thunkLoadEventsByGroupId } from "../../store/events.js";
import { thunkDeleteGroup } from "../../store/groups.js";
import "./SingleGroup.css";
import OpenModalButton from "../OpenModalButton/index.js";
import DeleteModal from "../DeleteModal/index.js";

export default function SingleGroup()
{
    const { groupId } = useParams();
    //group is an empty object before the useEffect runs
    //it shouldn't be empty if linked from create group/update group? if the store was just updated
    const group = useSelector(state => state.groups.singleGroup);
    const groupIsNotEmpty = Object.keys(group).length !== 0;

    //state.events.allEvents is initially an empty obj so events is an empty obj before the first useEffect
    let events = useSelector(state => Object.values(state.events.allEvents));
    //console.log("events-----   ", events);

    const sessionUser = useSelector((state) => state.session.user);
    let userIsOrganizer;

    if(groupIsNotEmpty && sessionUser)
    {
        //changed this from .Organizer.id to .organizerId
        group.organizerId === sessionUser.id ?
        userIsOrganizer = true : userIsOrganizer = false;
    }
    let showButton = true;
    if(userIsOrganizer || sessionUser === null) showButton = false;
    const joinButton = <button onClick={onClick}>Join this group</button>;

    const history = useHistory();
    const dispatch = useDispatch();
    useEffect(() => {
        //only reload the singleGroup in the store if the current singleGroup
        //does not match the page (groupId) you are on, if empty does not match
        if(Number(groupId) !== group.id)
        {
            //double that check if right singleGroup guarantees
            //the right allEvents group
            dispatch(thunkLoadSingleGroup(groupId));
            dispatch(thunkLoadEventsByGroupId(groupId));
            //loading delay for images pulled from events by group id
        }
    }, [dispatch, groupId])

    function onClick()
    {
        return window.alert("Feature Coming Soon");
    }
    function onUpdateClick()
    {
        if(userIsOrganizer) history.push(`/groups/${groupId}/edit`);
        else history.push("/")
        //maybe history.replace() to prevent going back or <Redirect> instead?
    }
    //eventually move to this function to the DeleteModal
    async function onDeleteClick()
    {
        if(userIsOrganizer)
        {
            const serverObject = await dispatch(thunkDeleteGroup(groupId));
            if(serverObject.message === "Successfully deleted")
            {
                console.log("the group was deleted");
                history.replace("/groups");
            }else{
                //adjust later
                return window.alert("Something went wrong");
            }
        }
    }
    function linkToEvent(e)
    {
        //clicking anywhere on the div that has details for eventId links to the event details page
        //the id is `groupEventBlock${ele.id}` and groupEventBlock is 15 chars long
        //slice(15) starts at INDEX 15
        const eventId = e.currentTarget.id.slice(15);
        history.push(`/events/${eventId}`);
    }
    if( groupIsNotEmpty === false) return <div>loading</div>
    return (
        <>
            <div>SINGLE GROUP PAGE -- GROUP {groupId} REMOVE LATER</div>
            <NavLink to="/groups">Groups</NavLink>
            {/* <NavLink to={`/groups/${groupId}/edit`}>Update</NavLink> */}
            <button>Create event</button>
            <button onClick={onUpdateClick}>Update</button>
            <button onClick = {onDeleteClick}>Delete</button>
            <OpenModalButton id="deleteGroup" buttonText="Delete Group"
                modalComponent={<DeleteModal typeId={groupId} type="group"/>}/>
            <div className="ImageAndSide">
                <div>
                    <img alt="alt" src={group.GroupImages[0].url}></img>
                </div>
                <div>
                    <h1>{group.name}</h1>
                    <div>{`${group.city}, ${group.state}`}</div>
                        {/* put the dot in its own div in all groups */}
                    <div>{group.numMembers} &bull; {group.private ? "Private" : "Public"}</div>
                    <div>Organized by {group.Organizer.firstName} {group.Organizer.lastName}</div>
                    { showButton && joinButton }
                    {/* { showButton && <button onClick={onClick}>Join this group</button> } */}
                </div>
            </div>

            <div>
                <h2>Organizer</h2>
                <div>{group.Organizer.firstName} {group.Organizer.lastName}</div>
            </div>

            <h2>What we're about</h2>
            <div>{group.about}</div>

            <div>Upcoming Events</div>

            <div className="allEventsByGroupContainer">
                {
                    events.map(ele => (
                        <div id={`groupEventBlock${ele.id}`} className="groupEventBlock" onClick={linkToEvent} key={`groupEvent${ele.id}`}>
                            <div>
                                <img alt="alt" src={ele.previewImage}></img>
                            </div>

                            <div>
                                <div>{`Starts on ${ele.startDate.slice(0,10)} Ends on ${ele.endDate.slice(0,10)}`}</div>
                                <div>{ele.name }</div>
                                <div>{`${ele.Group.city}, ${ele.Group.state}`}</div>
                            </div>

                                {
                                userIsOrganizer &&
                                    (<div>
                                        <button>Create Event</button>
                                        <button>Update</button>
                                        <button>Delete</button>
                                    </div>)
                                }

                        </div>
                    ))

                }
            </div>

            {/* {
                userIsOrganizer &&
                    (<div>
                        <button>Create Event</button>
                        <button>Update</button>
                        <button>Delete</button>
                    </div>)
            } */}

            <div>Past Events</div>
        </>
    )
}
