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
        }
    } catch (error){
    const errorData = await error.json();
    return errorData;
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
        }
    } catch (error){
        const errorData = await error.json();
        return errorData;
    }
}

const actionReceiveGroup = (group) => {
    return {
        type: RECEIVE_GROUP,
        group
    }
}
export const thunkReceiveGroup = (Organizer, group) => async (dispatch) => {
    const imgBody = {
        url: group.url,
        preview: true
    }
    delete group.url;
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
                headers: { "Content-Type":  "application/json" },
                body: JSON.stringify(imgBody)
            }
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
        const errorData = await error.json();
        return errorData;
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
            return state;
        case REMOVE_GROUP:
          return state;
        default:
          return state;
      }
};

export default groupsReducer;
