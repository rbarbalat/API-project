import { useEffect } from "react";
import { useParams, NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { thunkLoadSingleGroup } from "../../store/groups.js";
import "./SingleGroup.css";

export default function SingleGroup()
{
    const { groupId } = useParams();
    const group = useSelector(state => state.groups.singleGroup);
    const sessionUser = useSelector((state) => state.session.user);
    let userIsOrganizer;
    if(group && sessionUser)
    {
        group.Organizer.id === sessionUser.id ?
        userIsOrganizer = true : userIsOrganizer = false;
    }
    let showButton = true;
    if(userIsOrganizer || sessionUser === null) showButton = false;
    const joinButton = <button onClick={onClick}>Join this group</button>;

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(thunkLoadSingleGroup(groupId));
    }, [dispatch, groupId])

    function onClick()
    {
        return window.alert("Feature Coming Soon");
    }
    if(group === undefined) return <div>loading</div>
    return (
        <>
            <div>SINGLE GROUP PAGE -- GROUP {groupId} REMOVE LATER</div>
            <NavLink to="/groups">Groups</NavLink>
            <div className="ImageAndSide">
                <div>
                    <img alt="alt"></img>
                </div>
                <div>
                    <h1>{group.name}</h1>
                    <div>{`${group.city}, ${group.state}`}</div>
                    <div>{group.numMembers} * {group.private ? "Private" : "Public"}</div>
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

            {
                userIsOrganizer &&
                    (<div>
                        <button>Create Event</button>
                        <button>Update</button>
                        <button>Delete</button>
                    </div>)
            }

            <div>Past Events</div>
        </>
    )
}
