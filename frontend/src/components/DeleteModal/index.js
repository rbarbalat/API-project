import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import "./DeleteModal.css";
import { thunkDeleteGroup } from "../../store/groups";
import { thunkDeleteEvent } from "../../store/events";

export default function DeleteModal({typeId, type, eventGroupId})
{
    const dispatch = useDispatch();
    const history = useHistory();
    const { closeModal } = useModal();
    async function onDeleteClick()
    {
        //test for userIsOrganizer will take place inside the group/groupId page
        if(type === "group")
        {
            const serverObject = await dispatch(thunkDeleteGroup(typeId));
            if(serverObject.message === "Successfully deleted")
            {
                history.replace("/groups");
                closeModal();
            }else{
                return window.alert("Something went wrong");
            }
        }
        if(type === "event")
        {
            const serverObject = await dispatch(thunkDeleteEvent(typeId));
            if(serverObject.message === "Successfully deleted")
            {
                closeModal();
                history.replace(`/groups/${eventGroupId}`);
            }else{
                return window.alert("Something went wrong");
            }
        }
    }

    return (
        <>
        <div className="deleteModalWrapper">
            <div id="confirm">Confirm Delete</div>
            <div id="youSure">Are you sure you want to remove this {type}?</div>
            <button className="yesDelete" onClick={onDeleteClick}>Yes (Delete {type})</button>
            <button className="noDelete" onClick={closeModal}>No (Keep {type})</button>
        </div>
        </>
    )
}
