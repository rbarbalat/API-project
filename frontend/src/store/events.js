import { csrfFetch } from "./csrf";

export const LOAD_EVENTS = 'events/LOAD_EVENTS';
export const LOAD_SINGLE_EVENT = "events/LOAD_SINGLE_EVENT";
export const RECEIVE_EVENT = 'events/RECEIVE_EVENT';
export const UPDATE_EVENT = 'events/UPDATE_EVENT';
export const REMOVE_EVENT = 'events/REMOVE_event';

const actionLoadEvents = (events) => {
    return {
        type: LOAD_EVENTS,
        events
    }
}

export const thunkLoadEvents = () => async (dispatch) => {
    const res = await csrfFetch("/api/events");
    if(res.ok)
    {
        const serverData = await res.json();
        dispatch(actionLoadEvents(serverData));
        return serverData;
    }
    else
    {
        const errorData = await res.json();
        return errorData;
    }
}

export const thunkLoadEventsByGroupId = (groupId) => async (dispatch) => {
    const res = await csrfFetch(`/api/groups/${groupId}/events`);
    if(res.ok)
    {
        const serverData = await res.json();
        dispatch(actionLoadEvents(serverData));
        return serverData;
    }
    else
    {
        const errorData = await res.json();
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
    const res = await csrfFetch(`/api/events/${eventId}`);
    if(res.ok)
    {
        const serverData = await res.json();
        dispatch(actionLoadSingleEvent(serverData));
        return serverData;
    }else
    {
        const errorData = await res.json();
        return errorData;
    }
}

const actionReceiveEvent = (event) => {
    return {
        type: RECEIVE_EVENT,
        event
    }
}

export const thunkReceiveEvent = (group, event, formData) => async (dispatch) => {
    const options = {
        method: "Post",
        headers: { "Content-Type":  "application/json" },
        body: JSON.stringify(event)
    };
        const res = await csrfFetch(`/api/groups/${group.id}/events`, options);
        if(res.ok)
        {
            const serverData = await res.json();

            //assume event creator will attend
            serverData.numAttending = 1;

            serverData.Venue = null;
            serverData.Group = group;

            const imgOptions = {
                method: "Post",
                body: formData
            }
            const imageRes = await csrfFetch(`/api/events/${serverData.id}/images`, imgOptions);
            if(imageRes.ok)
            {
                const imageServerData = await imageRes.json();
                serverData.previewImage = imageServerData.url;
                //EventImages is also added as a key to the group object inside allEvents
                //never accessed and removed the next time /groups reloads
                serverData.EventImages = [imageServerData];
                dispatch(actionReceiveEvent(serverData));
                return serverData;
            }
            //only way that !imageRes.ok is if the event d.n exist but we are inside res.ok for event creation
        }
        else
        {
            const errorData = await res.json();
            return errorData;
        }
}

const actionDeleteEvent = (eventId) => {
    return {
        type: REMOVE_EVENT,
        eventId
    }
}

export const thunkDeleteEvent = (eventId) => async (dispatch) => {
    const options = {
        method: "Delete"
    }
    const res = await csrfFetch(`/api/events/${eventId}`, options);
    if(res.ok)
    {
        const serverData = await res.json();
        dispatch(actionDeleteEvent(eventId))
        return serverData;
    }else{
        const errorData = await res.json();
        console.log("bad response from thunkDeleteEvent");
        console.log(errorData);
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
            return {...state, allEvents: {...state.allEvents, [action.event.id]: action.event  }, singleEvent: {...action.event}}
        case UPDATE_EVENT:
            return state;
        case REMOVE_EVENT:
            const newAllEvents = {...state.allEvents};
            delete newAllEvents[action.eventId];
            return { allEvents: newAllEvents, singleEvent: {} };
        default:
          return state;
      }
};

export default eventsReducer;
