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
//get all events by group ID
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

            //adjust venue
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
            //only possible error response for posting to eventImages is if the event doesn't exist
            //but we created it before trying to post to it
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

/*
all events

    {
      "id": 1,
      "groupId": 1,
      "venueId": 1,
      "name": "Tennis Singles",
      "type": "In Person",
      "startDate": "2021-11-20 20:00:00",
      "endDate": "2021-11-19 22:00:00",
      "numAttending": 4,
      "previewImage": "image url",
      "Group": {
        "id": 1,
        "name": "Evening Tennis on the Water",
        "city": "New York",
        "state": "NY"
      },
      "Venue": {
        "id": 1,
        "city": "New York",
        "state": "NY",
      },
    },

*/

/*
single event

{
  "id": 1,
  "groupId": 1,
  "venueId": 1,
  "name": "Tennis Group First Meet and Greet",
  "description": "First meet and greet event for the evening tennis on the water group! Join us online for happy times!",
  "type": "Online",
  "capacity": 10,
  "price": 18.50,
  "startDate": "2021-11-19 20:00:00",
  "endDate": "2021-11-19 22:00:00",
  "numAttending": 8,
  "Group": {
    "id": 1,
    "name": "Evening Tennis on the Water",
    "private": true,
    "city": "New York",
    "state": "NY"
  },
  "Venue": {
    "id": 1,
    "address": "123 Disney Lane",
    "city": "New York",
    "state": "NY",
    "lat": 37.7645358,
    "lng": -122.4730327,
  },
  "EventImages": [
    {
      "id": 1,
      "url": "image url",
      "preview": true
    },
    {
      "id": 2,
      "url": "image url",
      "preview": false
    }
  ],
}


*/

/*

succesful for creating an event
{
  "id": 1,
  "groupId": 1,
  "venueId": 1,
  "name": "Tennis Group First Meet and Greet",
  "type": "Online",
  "capacity": 10,
  "price": 18.50,
  "description": "The first meet and greet for our group! Come say hello!",
  "startDate": "2021-11-19 20:00:00",
  "endDate": "2021-11-19 22:00:00",
}

*/

/*
request body
{
  "venueId": 1,
  "name": "Tennis Group First Meet and Greet",
  "type": "Online",
  "capacity": 10,
  "price": 18.50,
  "description": "The first meet and greet for our group! Come say hello!",
  "startDate": "2021-11-19 20:00:00",
  "endDate": "2021-11-19 22:00:00",
}

*/
