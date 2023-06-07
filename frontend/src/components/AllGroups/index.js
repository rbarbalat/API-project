import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { thunkLoadGroups } from "../../store/groups.js"
import {NavLink, useHistory} from "react-router-dom";
import "./AllGroups.css";

export default function AllGroups()
{
    //can't do Object.values() right away b/c if undefined get TypeError
    let groups = useSelector(state => state.groups.allGroups);
    if( groups !== undefined) groups = Object.values(groups);
    //console.log("groups-----  ", groups);
    const history = useHistory();
    const dispatch = useDispatch();
    useEffect(() => {
        //console.log("hello");
        dispatch(thunkLoadGroups());
    }, [dispatch])

    function onClick(event)
    {
        //clicking anywhere on the div that has details for groupId links to the group details page
        //the id is `groupBlock${ele.id}` and groupBlock is 10 chars long
        //slice(10) starts at INDEX 10
        const groupId = event.currentTarget.id.slice(10);
        history.push(`/groups/${groupId}`);
    }

    if(groups === undefined) return <div> All Groups Page Loading</div>
    return (
        <>
            <div className="allGroupsHeader">
                <div className="EventsGroupsContainer">
                    <NavLink id="EventsNavLink" to ="/">
                        Events
                    </NavLink>
                    <NavLink to="/">
                        Groups
                    </NavLink>
                </div>
                <div>
                    Groups in Meetup
                </div>
            </div>
            <div className="allGroupsContainer">
                {
                    groups.map(ele => (
                        <div id={`groupBlock${ele.id}`} className="groupBlock" onClick={onClick} key={`group${ele.id}`}>
                            <div className="groupImageContainer">
                                <img alt="alt" src={ele.previewImage}></img>
                            </div>

                            <div>
                                <div>{ele.name}</div>
                                <div>{`${ele.city}, ${ele.state}`}</div>
                                <div>{ele.about}</div>
                                <div className="numType">
                                    {/* <div>### events</div>
                                    <div>Public or Private</div> */}
                                    <div className="numTypeLeft">{`${ele.numMembers} Members`}</div>
                                    {/* change this asterisk to a dot later */}
                                    <div className="numTypeCenter">&bull;</div>
                                    <div>{ele.private ? "Private" : "Public"}</div>
                                </div>

                            </div>
                        </div>
                    ))
                }
            </div>
            {/* <ul>
                {
                    groups.map(ele => (
                        <li key={ele.id}>
                          {ele.id} --- {ele.name} ----- {ele.about}
                        </li>
                    ))
                }
            </ul> */}
        </>
    )
}
