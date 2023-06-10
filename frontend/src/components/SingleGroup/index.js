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
        group.organizerId === sessionUser.id ?
        userIsOrganizer = true : userIsOrganizer = false;
    }
    let showJoinButton = true;
    if(userIsOrganizer || sessionUser === null) showJoinButton = false;
    const joinButton = <div className="singleGroupJoinButton"><button onClick={onClick}>Join this group</button></div>;
    const manageButtons = (<div className="singleGroupManageButtons">
                                <button onClick={onCreateEventClick}>Create Event</button>
                                <button onClick={onUpdateClick}>Update</button>
                                <button>Delete</button>
                            </div>);

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
        //button only visible if userIsOrganizer
        history.push(`/groups/${groupId}/edit`);
    }
    function onCreateEventClick()
    {
        //button only visible if userIsOrganizer
        history.push(`/groups/${groupId}/events/new`);
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
            <div className="singleGroupLinkFavicon">
                <i id="singleGroupLessThanSign" className="fa-light fa-less-than"></i>
                <NavLink id="singleGroupLinkToGroups" to="/groups">Groups</NavLink>
            </div>
            {/* <button>Create event</button>
            <button onClick = {onDeleteClick}>Delete</button> */}
            {/* <OpenModalButton id="deleteGroup" buttonText="Delete Group"
                modalComponent={<DeleteModal typeId={groupId} type="group"/>}/> */}
            <div className="middleSingleGroup">
                <div className="groupImageSingleGroup">
                    <img id="groupImagePicSingleGroup" alt="alt" src={group.GroupImages[0].url}></img>
                </div>
                <div className="rightSectionSingleGroup">
                    <div className="rightSectionSingleGroupTop">
                        <div className="singleGroupName">{group.name}</div>
                        {/* <NavLink to={`/groups/${groupId}/events/new`}>Temp Create Event</NavLink> */}
                        <div className="singleGroupLocation">{`${group.city}, ${group.state}`}</div>
                        <div className="singleGroupNumType">{group.numMembers === 0 ? 1 : group.numMembers} &bull; {group.private ? "Private" : "Public"}</div>
                        <div className="singleGroupOrganizer">Organized by {group.Organizer.firstName} {group.Organizer.lastName}</div>
                    </div>
                    { showJoinButton && joinButton }
                    { userIsOrganizer && manageButtons}
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

                                {/* {
                                userIsOrganizer &&
                                    (<div>
                                        <button>Create Event</button>
                                        <button>Update</button>
                                        <button>Delete</button>
                                    </div>)
                                } */}

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
