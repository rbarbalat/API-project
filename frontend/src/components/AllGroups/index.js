import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { thunkLoadGroups } from "../../store/groups.js"

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
            <div>All Groups Page</div>
            <ul>
                {
                    groups.map(ele => (
                        <li key={ele.id}>
                          {ele.id} --- {ele.name} ----- {ele.about}
                        </li>
                    ))
                }
            </ul>
        </>
    )
}
