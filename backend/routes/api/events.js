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

//Add an Image to a Event based on the Event's id, authenticated user
//must be host,co-host or attendde of event, checked w/ TA host/co-host = of the group holding event
router.post("/:eventId/images", requireAuth, async (req,res) => {
    const { user } = req;
    const event = await Event.findByPk(req.params.eventId);
    if(event == null)
    {
        res.status(404);
        return res.json({ message: "Event couldn't be found"});
    }
    //try to find the logged in user in the member table w/ the right group and status
    const authorized = await Membership.findOne({
        where: {
            groupId: event.groupId,
            userId: user.id,
            status: {
                [Op.in]: ["co-host", "Organizer"]
            }
        }
    });
    //console.log(Object.getOwnPropertyNames(Event.prototype));
    //getAtten always returns an array, if nothing found then empty array
    const attendees = await event.getAttendances({
        where: {
            status: "attending",
            userId: user.id
        }
    });
    if(authorized == null && attendees.length == 0)
    {
        res.status(403);
        return res.json({ message: "Forbidden"});
    }
    const { url, preview } = req.body;
    //could also EventImage.create() and put eventId: event.id in there
    const newImage = await event.createEventImage({
        url,
        preview
    });
    res.json({
        id: newImage.id,
        url: newImage.url,
        preview: newImage.preview
    });
})

//Edit an Event specified by its id, authenticate organizer or co-host
router.put("/:eventId", requireAuth, async (req, res) => {
    const { user } = req;
    const event = await Event.findByPk(req.params.eventId);
    if(event == null)
    {
        res.status(404);
        return res.json({ message: "Event couldn't be found"});
    }
    //try to find the logged in user in the member table w/ the right group and status
    const authorized = await Membership.findOne({
        where: {
            groupId: event.groupId,
            userId: user.id,
            status: {
                [Op.in]: ["co-host", "Organizer"]
            }
        }
    });
    if(authorized == null)
    {
        res.status(403);
        return res.json({ message: "Forbidden"});
    }
    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body
    await event.set({
        venueId,
        name,
        type,
        capacity,
        price,
        description,
        startDate,
        endDate
    })
    await event.save();
    const eventOBJ = event.toJSON();
    delete eventOBJ.createdAt;
    delete eventOBJ.updatedAt;
    res.json(eventOBJ);
})

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

router.delete("/:eventId", requireAuth, async (req,res) => {
    const { user } = req;
    const event = await Event.findByPk(req.params.eventId);
    if(event == null)
    {
        res.status(404);
        return res.json({ message: "Event couldn't be found"});
    }
    //try to find the logged in user in the member table w/ the right group and status
    const authorized = await Membership.findOne({
        where: {
            groupId: event.groupId,
            userId: user.id,
            status: {
                [Op.in]: ["co-host", "Organizer"]
            }
        }
    });
    if(authorized == null)
    {
        res.status(403);
        return res.json({ message: "Forbidden"});
    }
    await event.destroy();
    res.json({ message: "Successfully deleted"});
})

//getAllEventsofAgroupSpecifiedbyId, /groups/:groupId/events

module.exports = router;
