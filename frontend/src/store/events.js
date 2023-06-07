import { csrfFetch } from "./csrf";

export const LOAD_EVENTS = 'events/LOAD_EVENTS';
export const LOAD_SINGLE_EVENT = "events/LOAD_SINGLE_EVENT";
export const RECEIVE_EVENT = 'events/RECEIVE_EVENT';
export const UPDATE_EVENT = 'events/UPDATE_EVENT';
export const REMOVE_EVENT = 'events/REMOVE_event';

const actionLoadEvents = (events) => {
    //events is an object with a key of "Events" whose val is an array
    return {
        type: LOAD_EVENTS,
        events
    }
}
//get all events
export const thunkLoadEvents = () => async (dispatch) => {
    try {
        const res = await csrfFetch("/api/events");
        if(res.ok)
        {
            const serverData = await res.json();
            dispatch(actionLoadEvents(serverData));
            return serverData;
        }
    } catch(error){
        const errorData = await error.json();
        return errorData;
    }
}
//get all events by group ID
export const thunkLoadEventsByGroupId = (groupId) => async (dispatch) => {
    try {
        const res = await csrfFetch(`/api/groups/${groupId}/events`);
        if(res.ok)
        {
            const serverData = await res.json();
            dispatch(actionLoadEvents(serverData));
            return serverData;
        }
    } catch(error){
        const errorData = await error.json();
        return errorData;
    }
}

const actionLoadSingleEvent = (singleEvent) => {
    return {
        type: LOAD_SINGLE_EVENT,
        singleEvent
    }
}

export const thunkLoadSingleEvent = (eventId) => async (dispatch) => {
    try{
        const res = await csrfFetch(`/api/events/${eventId}`);
        if(res.ok)
        {
            const serverData = await res.json();
            dispatch(actionLoadSingleEvent(serverData));
            return serverData;
        }
    } catch(error){
        const errorData = await error.json();
        return errorData;
    }
}

const initialState = {
    allEvents: {},
    singleEvent: {}
}

const eventsReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOAD_EVENTS:
          const normEvents = {};
          action.events.Events.forEach((ele) => {
            normEvents[ele.id] = ele;
          });
          return {...state,  allEvents: normEvents };
        case LOAD_SINGLE_EVENT:
            return {...state, singleEvent: {...action.singleEvent} }
        case RECEIVE_EVENT:
            return state;
        case UPDATE_EVENT:
            return state;
        case REMOVE_EVENT:
          return state;
        default:
          return state;
      }
};

export default eventsReducer;
