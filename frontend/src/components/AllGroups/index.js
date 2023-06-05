import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { thunkLoadGroups } from "../../store/groups.js"
import {NavLink} from "react-router-dom";
import "./AllGroups.css";

export default function AllGroups()
{
    //can't do Object.values() right away b/c if undefined get TypeError
    let groups = useSelector(state => state.groups.allGroups);
    if( groups !== undefined) groups = Object.values(groups);
    console.log("groups-----  ", groups);
    const dispatch = useDispatch();
    useEffect(() => {
        console.log("hello");
        dispatch(thunkLoadGroups());
    }, [dispatch])

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
                        <div className="groupBlock" key={`group${ele.id}`}>
                            <div>
                                <img src={ele.previewImage}></img>
                            </div>
                            <div>
                                <div>{ele.name}</div>
                                <div>{`${ele.city}, ${ele.state}`}</div>
                                <div>{ele.about}</div>
                                <div className="numType">
                                    {/* <div>### events</div>
                                    <div>Public or Private</div> */}
                                    <div className="numTypeLeft">{`${ele.numMembers} Members`}</div>
                                    <div className="numTypeCenter">*</div>
                                    <div>{ele.type}</div>
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
