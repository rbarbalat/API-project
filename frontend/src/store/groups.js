import { csrfFetch } from "./csrf";

export const LOAD_GROUPS = 'groups/LOAD_GROUPS';
export const LOAD_SINGLE_GROUP = "groups/LOAD_SINGLE_GROUP";
export const RECEIVE_GROUP = 'groups/RECEIVE_GROUP';
export const UPDATE_GROUP = 'groups/UPDATE_GROUP';
export const REMOVE_GROUP = 'groups/REMOVE_GROUP';

//click "See all groups" on the loading page
//redirected to "/groups";
//want a single column in which each row is a group
//each row contains/ Name, Location, description, public/private, events

const actionLoadGroups = (groups) => {
    //groups is an obj with a key of "Groups" whose val is an array
    return {
        type: LOAD_GROUPS,
        groups
    }
}
export const thunkLoadGroups = () => async (dispatch) => {
    try {
        const res = await csrfFetch("/api/groups");
        if(res.ok)
        {
            const serverData = await res.json();
            dispatch(actionLoadGroups(serverData));
            return serverData;
        }else{
            const errorData = await res.json();
            console.log("bad response from thunkLoadGroups");
            console.log(errorData);
            return errorData;
        }
    } catch (error){
        console.log("caught error from thunkLoadGroups")
        console.log(error);
    }
}
const actionLoadSingleGroup = (singleGroup) => {
    return {
        type: LOAD_SINGLE_GROUP,
        singleGroup
    }
}
export const thunkLoadSingleGroup = (groupId) => async (dispatch) => {
    try {
        const res = await csrfFetch(`/api/groups/${groupId}`);
        if(res.ok)
        {
            const serverData = await res.json();
            dispatch(actionLoadSingleGroup(serverData));
            return serverData;
        }else{
            const errorData = await res.json();
            console.log("bad response from thunkLoadSingleGroup");
            console.log(errorData);
            return errorData;
        }
    } catch (error){
        console.log("caught error from thunkLoadSinglegroup");
        console.log(error);
    }
}

const actionReceiveGroup = (group) => {
    return {
        type: RECEIVE_GROUP,
        group
    }
}
const actionUpdateGroup = (group) => {
    return {
        type: UPDATE_GROUP,
        group
    }
}
export const thunkReceiveGroup = (Organizer, create, groupId, group, formData) => async (dispatch) => {
    //let method = create ? "Post" : "Put";
    if(create === false)
    {
        const imageId = group.imageId;
        delete group.imageId;
        const options = {
            method: "Put",
            headers: { "Content-Type":  "application/json" },
            body: JSON.stringify(group)
        };
        try{
            const res = await csrfFetch(`/api/groups/${groupId}`, options);
            if(res.ok)
            {
                console.log("line 91")
                const serverData = await res.json();
                const imgOptions = formData ? {method: "Put", body: formData } : null;
                console.log("imgOptions ", imgOptions)
                const imageRes = imgOptions ? await csrfFetch(`/api/group-images/${imageId}`, imgOptions)
                                            : null;

                if(imageRes.ok)
                {
                    const imageServerData = await imageRes.json();
                    serverData.previewImage = imageServerData.url;
                    serverData.GroupImages = [imageServerData];
                    dispatch(actionUpdateGroup(serverData));
                    return serverData;
                }
                // dispatch(actionUpdateGroup(serverData));
                // return serverData;
            }else{
                const errorData = await res.json();
                console.log("bad response from thunkReceiveGroup");
                console.log(errorData);
                return errorData;
            }
        }catch (error)
        {
            console.log("caught error from thunkReceiveGroup")
            console.log(error);
            return;
        }
    }
    const options = {
        method: "Post",
        headers: { "Content-Type":  "application/json" },
        body: JSON.stringify(group)
    };
    try {
        const res = await csrfFetch("/api/groups", options);
        if(res.ok)
        {
            const serverData = await res.json();
            serverData.numMembers = 1;
            serverData.Organizer = Organizer;

            const imgOptions = {
                method: "Post",
                body: formData
            }
            console.log("formData inside the thunk");
            console.log(formData)
            const imageRes = await csrfFetch(`/api/groups/${serverData.id}/images`, imgOptions);
            if(imageRes.ok)
            {
                const imageServerData = await imageRes.json();
                serverData.previewImage = imageServerData.url;
                //GroupImages is also added as a key to the group object inside allGroups
                //never accessed and removed the next time /groups reloads
                serverData.GroupImages = [imageServerData];
                dispatch(actionReceiveGroup(serverData));
                return serverData;
            }
            //only possible error response for posting to groupimages is if the group doesn't exist
            //so probably didn't even need imageRes.ok if statement
        }
    } catch (error)
    {
        console.log("caught error from thunkReceiveGroup")
        console.log(error);
    }
}

const actionDeleteGroup = (groupId) => {
    return {
        type: REMOVE_GROUP,
        groupId
    }
}

export const thunkDeleteGroup = (groupId) => async (dispatch) => {
    const options = {
        method: "Delete"
    }
    try{
        const res = await csrfFetch(`/api/groups/${groupId}`, options);
        if(res.ok)
        {
            const serverData = await res.json();
            dispatch(actionDeleteGroup(groupId))
            return serverData;
        }else{
            const errorData = await res.json();
            console.log("bad response from thunkDeleteGroup");
            console.log(errorData);
            return errorData;
        }
    } catch(error)
    {
        console.log("caught error response from thunkDeleteGroup");
        console.log(error);
    }
}

const initialState = {
    allGroups: {},
    singleGroup: {}
}
const groupsReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOAD_GROUPS:
            const normGroups = {};
            action.groups.Groups.forEach((ele) => {
                normGroups[ele.id] = ele;
            });
            return {...state, allGroups: normGroups };
        case LOAD_SINGLE_GROUP:
            //double check if needs to be a new ref at every level of nesting
            return {...state, singleGroup: {...action.singleGroup} }
        case RECEIVE_GROUP:
            //action.group is the new group object, its id is action.group.id which will be used as its key in allGroups
            return {...state, allGroups: {...state.allGroups, [action.group.id]: action.group  }, singleGroup: {...action.group}}
        case UPDATE_GROUP:
            //when you update a group the singleGroup is already in there w/ keys like GroupImages, Venues, Organizer
            //that don't come back in the response so need to spread it to preserve those keys, diff than Receive where you manually update those
            return {...state, allGroups: {...state.allGroups, [action.group.id]: action.group  }, singleGroup: {...state.singleGroup, ...action.group}}
        case REMOVE_GROUP:
            const newAllGroups = {...state.allGroups};
            delete newAllGroups[action.groupId];
            return { allGroups: newAllGroups, singleGroup: {} };
        default:
            return state;
      }
};

export default groupsReducer;
