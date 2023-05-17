const express = require('express');
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Group, User, Membership, GroupImage, Venue, Event, EventImage } = require('../../db/models');
const router = express.Router();

const { Op } = require("sequelize");

//get all events authentication false
router.get("/", async (req,res) => {
    let allEvents = await Event.findAll({
        include: [
                    {
                        model: Group,
                        attributes: ["id", "name", "city", 'state']
                    },
                    {
                       model: Venue,
                       attributes: ["id", "city", "state"]
                    },
                    {
                        model: EventImage,
                        attributes: ["url"],
                        where: {
                            preview: true
                        },
                        required: false
                    }
                 ]
    });
    //console.log(Object.getOwnPropertyNames(Event.prototype));
    const numAttending = [];
    //PROB NEED TO CHANGE TO COUNT ATTENDANCES AND FILTER
    for(let i = 0; i<allEvents.length; i++)
    {
        numAttending.push(await allEvents[i].countAttendances({
            where: {
                status: "attending"
            }
        }));
        allEvents[i] = allEvents[i].toJSON();
        //add the numAttending property to the newly created POJO
        allEvents[i].numAttending = numAttending[i];
    }
    //allEvents = allEvents.map(ele => ele.toJSON());
    allEvents.forEach(async ele => {
        if(ele.EventImages.length != 0) ele.previewImage = ele.EventImages[0].url;
        else ele.previewImage = "no preview image available";
        delete ele.EventImages;
    });
    res.json(allEvents);
});

//get Details of an Event specified by its id, authen false
router.get("/:eventId", async (req, res) => {
    let event = await Event.findByPk(req.params.eventId, {
        include: [
                    {
                        model: Group,
                        attributes: ["id", "name", "private", "city", "state"]
                    },
                    {
                        model: Venue,
                        attributes: ["id", "address", "city", "state", "lat", "lng"]
                    },
                    {
                        model: EventImage,
                        attributes: ["id", "url", "preview"]
                    }
                 ]
    });
    if(event == null)
    {
        res.status(404);
        return res.json({ message: "Event couldn't be found"});
    }
    console.log(Object.getOwnPropertyNames(Event.prototype));
    const eventOBJ = event.toJSON();
    eventOBJ.numAttending = await event.countAttendances({
        where: {
            status: "attending"
        }
    });
    res.json(eventOBJ);
});

//getAllEventsofAgroupSpecifiedbyId, /groups/:groupId/events

//Create an Event for a Group specified by its id, reqAuth, org/cohost

//Add an Image to a Event based on the Event's id, attending,host,cohost of the event

module.exports = router;
