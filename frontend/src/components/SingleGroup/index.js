import { useEffect } from "react";
import { useParams, NavLink, useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { thunkLoadSingleGroup } from "../../store/groups.js";
import { thunkLoadEventsByGroupId } from "../../store/events.js";
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
    events.sort((a,b) => {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
    const upcomingEvents = events.filter(ele => new Date(ele.startDate).getTime() > new Date().getTime());
    const pastEvents = events.filter(ele => new Date(ele.startDate).getTime() < new Date().getTime());
    upcomingEvents.sort((a,b) => {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
    //most recent first, descending order
    pastEvents.sort((a,b) => {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

    const sessionUser = useSelector((state) => state.session.user);
    let userIsOrganizer;

    if(groupIsNotEmpty && sessionUser)
    {
        group.organizerId === sessionUser.id ?
        userIsOrganizer = true : userIsOrganizer = false;
    }
    let showJoinButton = true;
    if(userIsOrganizer || sessionUser === null) showJoinButton = false;
    const joinButton = <div className="singleGroupJoinButton"><button onClick={onJoinClick}>Join this group</button></div>;
    const manageButtons = (<div className="singleGroupManageButtons">
                                <button onClick={onCreateEventClick}>Create Event</button>
                                <button onClick={onUpdateClick}>Update</button>
                                <OpenModalButton id="deleteGroup" buttonText="Delete Group"
                                modalComponent={<DeleteModal typeId={groupId} type="group"/>}/>
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

    function onJoinClick()
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

            {/* visible if upcomingEvents.length > 0 || pastEvents.length > 0 */}
            <div className="grayBottom">

                <div className="singleGroupOrganizerInfo">
                    <div id="singleGroupOrganizer">Organizer</div>
                    <div id="singleGroupOrganizerNames">{group.Organizer.firstName} {group.Organizer.lastName}</div>
                </div>

                <div id="singleGroupAboutLabel">What we're about</div>
                <div id="singleGroupAbout">{group.about}</div>

                {upcomingEvents.length > 0 &&
                (<div className="upComingWrapper">
                    <div className="upComingHeader">Upcoming Events ({upcomingEvents.length})</div>
                    <div className="allGroupEventsContainer">
                        {
                            upcomingEvents.map(ele => (
                                <div id={`groupEventBlock${ele.id}`} className="groupEventBlock" onClick={linkToEvent} key={`groupEvent${ele.id}`}>
                                    <div className="groupEventBlockTop">

                                        <div className="groupEventImageContainer">
                                            <img className="allGroupEventImages" alt="alt" src={ele.previewImage}></img>
                                        </div>

                                        {/* <div>
                                            <div>{`Starts on ${ele.startDate.slice(0,10)} Ends on ${ele.endDate.slice(0,10)}`}</div>
                                            <div>{ele.name }</div>
                                            <div>{`${ele.Group.city}, ${ele.Group.state}`}</div>
                                        </div> */}

                                        <div className="groupEventInfoContainer">
                                            <div className="groupEventDateTime">
                                                <span>{`${ele.startDate.slice(0,10)} `}</span>
                                                <span>&bull;</span>
                                                <span>{` ${ele.startDate.slice(10)}`}</span>
                                            </div>
                                            <div className="groupEventName">{ele.name}</div>
                                            <div className="groupEventLocation">{ele.Venue !== null ? `${ele.Venue.city}, ${ele.Venue.state}` : `Denver, CO`}</div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>)}

                {pastEvents.length > 0 &&
                (<div className="pastWrapper">
                    <div>Past Events</div>
                </div>)}
            </div>
        </>
    )
}
