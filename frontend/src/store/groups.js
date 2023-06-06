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
const actionLoadSingleGroup = (singleGroup) => {
    return {
        type: LOAD_SINGLE_GROUP,
        singleGroup
    }
}
export const thunkLoadSingleGroup = (groupId) => async (dispatch) => {
    const res = await csrfFetch(`/api/groups/${groupId}`);
    if(res.ok)
    {
        const serverData = await res.json();
        dispatch(actionLoadSingleGroup(serverData));
        return serverData;
    }
    const errorData = await res.json();
    return errorData;
}

//const initialState = {};
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
            return state;
        case UPDATE_GROUP:
            return state;
        case REMOVE_GROUP:
          return state;
        default:
          return state;
      }
};

export default groupsReducer;

/*
SINGLE GROUP DETAILS FROM GET ALL GROUPS (missing all group images and venues)
        {
            "id": 1,
            "organizerId": 1,
            "name": "Hockey on the Water",
            "about": "Enjoy rounds of hockey with a tight-nit group of people on the water facing the Brooklyn Bridge. Singles or doubles.",
            "type": "In person",
            "private": true,
            "city": "Pittsburgh",
            "state": "PA",
            "createdAt": "2023-06-03T18:01:07.000Z",
            "updatedAt": "2023-06-03T18:01:07.000Z",
            "numMembers": 3,
            "previewImage": "www.google.com"
        }
*/

/*
SINGLE GROUP DETAILS FROM GET GROUPS BY ID
{
    "id": 1,
    "organizerId": 1,
    "name": "Hockey on the Water",
    "about": "Enjoy rounds of hockey with a tight-nit group of people on the water facing the Brooklyn Bridge. Singles or doubles.",
    "type": "In person",
    "private": true,
    "city": "Pittsburgh",
    "state": "PA",
    "createdAt": "2023-06-03T18:01:07.000Z",
    "updatedAt": "2023-06-03T18:01:07.000Z",
    "Organizer": {
        "id": 1,
        "firstName": "James",
        "lastName": "Howlett"
    },
    "GroupImages": [
        {
            "id": 1,
            "url": "www.google.com",
            "preview": true
        },
        {
            "id": 2,
            "url": "www.yahoo.com",
            "preview": false
        },
        {
            "id": 3,
            "url": "www.bing.com",
            "preview": false
        }
    ],
    "Venues": [
        {
            "id": 1,
            "groupId": 1,
            "address": "123 Murray Ave",
            "city": "Pittsburgh",
            "state": "PA",
            "lat": 30.331,
            "lng": 12.2967
        },
        {
            "id": 2,
            "groupId": 1,
            "address": "345 Forbes Ave",
            "city": "Pheonix",
            "state": "AZ",
            "lat": 21.22,
            "lng": 13.79
        },
        {
            "id": 3,
            "groupId": 1,
            "address": "567 Shady Ave",
            "city": "Los Angeles",
            "state": "CA",
            "lat": 17.51,
            "lng": 10
        }
    ],
    "numMembers": 3

*/
