import { useEffect } from "react";
import { useParams, NavLink, useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { thunkLoadSingleGroup } from "../../store/groups.js";
import { thunkLoadEventsByGroupId } from "../../store/events.js";
import OpenModalButton from "../OpenModalButton/index.js";
import DeleteModal from "../DeleteModal/index.js";
import { reformatTime } from "../../helpers/index.js";
import "./SingleGroup.css";

export default function SingleGroup()
{
    const { groupId } = useParams();
    //group is an empty object before the useEffect runs if coming from the allGroups page
    //if coming here after submission of group create/update form, should get the info right away from the store
    const group = useSelector(state => state.groups.singleGroup);
    const groupIsNotEmpty = Object.keys(group).length !== 0;

    let events = useSelector(state => Object.values(state.events.allEvents));

    let upcomingEvents = events.filter(ele => new Date(ele.startDate).getTime() > new Date().getTime());
    let pastEvents = events.filter(ele => new Date(ele.startDate).getTime() < new Date().getTime());
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
    const manageButtons = (
                            <div className="singleGroupManageButtons">
                                <button onClick={onCreateEventClick}>Create Event</button>
                                <button onClick={onUpdateClick}>Update</button>
                                <OpenModalButton id="deleteGroup" buttonText="Delete Group"
                                modalComponent={<DeleteModal typeId={groupId} type="group"/>}/>
                            </div>
                );

    const history = useHistory();
    const dispatch = useDispatch();
    useEffect(() => {
        if(Number(groupId) !== group.id)
        {
            //won't be triggered if coming from group create/edit page b/c the singleGroup
            //in the store is the right group

            //but if coming from allGroups, group is {} so group.id is undef the first time
            //the useEffect runs, so this thunk is dispatched
            dispatch(thunkLoadSingleGroup(groupId));
        }
        //must reload this b/c even if the current group is there, might go to
        //all events page and back and then will have all events instead of events by group id
        dispatch(thunkLoadEventsByGroupId(groupId));
    }, [dispatch, groupId])

    function onJoinClick()
    {
        return window.alert("Feature Coming Soon");
    }
    function onUpdateClick()
    {
        history.push(`/groups/${groupId}/edit`);
    }
    function onCreateEventClick()
    {
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

            <div className="middleSingleGroup">
                <div className="groupImageSingleGroup">
                    <img id="groupImagePicSingleGroup" alt="alt" src={group.GroupImages[0].url}></img>
                </div>
                <div className="rightSectionSingleGroup">
                    <div className="rightSectionSingleGroupTop">
                        <div className="singleGroupName">{group.name}</div>
                        <div className="singleGroupLocation">{`${group.city}, ${group.state}`}</div>
                        <div className="singleGroupNumType">{group.numMembers === 0 ? 1 : group.numMembers} Member(s) &bull; {group.private ? "Private" : "Public"}</div>
                        <div className="singleGroupOrganizer">Organized by {group.Organizer.firstName} {group.Organizer.lastName}</div>
                    </div>
                    { showJoinButton && joinButton }
                    { userIsOrganizer && manageButtons}
                </div>
            </div>

            <div className="grayBottom">

                <div className="singleGroupOrganizerInfo">
                    <div id="singleGroupOrganizer">Organizer</div>
                    <div id="singleGroupOrganizerNames">{group.Organizer.firstName} {group.Organizer.lastName}</div>
                </div>

                <div id="singleGroupAboutLabel">What we're about</div>
                <div id="singleGroupAbout">{group.about}</div>

                {upcomingEvents.length === 0 && pastEvents.length === 0
                    && <div className="noEventsAtAll">This group has no Upcoming or Past Events</div>}

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

                                        <div className="groupEventInfoContainer">
                                            <div className="groupEventDateTime">
                                                <span>{`${ele.startDate.slice(0,10)} `}</span>
                                                <span>&bull;</span>
                                                <span>{` ${reformatTime(ele.startDate)}`}</span>
                                            </div>
                                            <div className="groupEventName">{ele.name}</div>
                                            <div className="groupEventLocation">{ele.Venue !== null ? `${ele.Venue.city}, ${ele.Venue.state}` : `Denver, CO`}</div>
                                        </div>
                                    </div>


                                    <div className="groupEventBlockBottomDescription">
                                       {ele.description}
                                    </div>

                                </div>
                            ))
                        }
                    </div>
                </div>)}

                        {/* past events */}
                {pastEvents.length > 0 &&
                (<div className="upComingWrapper pastEventsWrapper">
                    <div className="upComingHeader">Past Events ({pastEvents.length})</div>
                    <div className="allGroupEventsContainer">
                        {
                            pastEvents.map(ele => (
                                <div id={`groupEventBlock${ele.id}`} className="groupEventBlock" onClick={linkToEvent} key={`groupEvent${ele.id}`}>
                                    <div className="groupEventBlockTop">

                                        <div className="groupEventImageContainer">
                                            <img className="allGroupEventImages" alt="alt" src={ele.previewImage}></img>
                                        </div>

                                        <div className="groupEventInfoContainer">
                                            <div className="groupEventDateTime">
                                                <span>{`${ele.startDate.slice(0,10)} `}</span>
                                                <span>&bull;</span>
                                                <span>{` ${reformatTime(ele.startDate)}`}</span>
                                            </div>
                                            <div className="groupEventName">{ele.name}</div>
                                            <div className="groupEventLocation">{ele.Venue !== null ? `${ele.Venue.city}, ${ele.Venue.state}` : `Denver, CO`}</div>
                                        </div>
                                    </div>


                                    <div className="groupEventBlockBottomDescription">
                                        {ele.description}
                                    </div>

                                </div>
                            ))
                        }
                    </div>
                </div>)}

                <div className="single_group_bottom_space"></div>
            </div>
        </>
    )
}
