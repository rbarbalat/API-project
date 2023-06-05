import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { thunkLoadGroups } from "../../store/groups.js"

export default function SingleGroup()
{
    const { groupId } = useParams();
    const dispatch = useDispatch();

    return (
        <>
            <div>SINGLE GROUP PAGE -- GROUP {groupId}</div>
        </>
    )
}
