import { csrfFetch } from "./csrf";

export const LOAD_GROUPS = 'groups/LOAD_REPORTS';
export const RECEIVE_GROUP = 'groups/RECEIVE_GROUP';
export const UPDATE_GROUP = 'groups/UPDATE_GROUP';
export const REMOVE_GROUP = 'groups/REMOVE_GROUP';

//click "See all groups" on the loading page
//redirected to "/groups";
//want a single column in which each row is a group
//each row contains/ Name, Location, description, public/private, events

const actionLoadGroups = (groups) => {
    //groups is an object with a key of "Groups"
    //whose value is an array
    return {
        type: LOAD_GROUPS,
        groups
    }
}
export const thunkLoadGroups = () => async (dispatch) => {
    const res = await csrfFetch("/api/groups");
    if(res.ok)
    {
        const serverData = await res.json();
        dispatch(actionLoadGroups(serverData));
        return serverData;
    }
    const errorData = await res.json();
    return errorData;
}

const initialState = {};

const groupsReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOAD_GROUPS:
          const normGroups = {};
          action.groups.Groups.forEach((ele) => {
            normGroups[ele.id] = ele;
          });
          return { allGroups: normGroups }
        case RECEIVE_GROUP:
            return state;
        //   return { ...state, [action.report.id]: action.report };
        case UPDATE_GROUP:
            return state;
        //   return { ...state, [action.report.id]: action.report };
        case REMOVE_GROUP:
          return state;
        default:
          return state;
      }
};

export default groupsReducer;
