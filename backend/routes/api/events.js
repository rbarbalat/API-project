const express = require('express');
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Group, User, Membership, GroupImage, Venue, Event, EventImage, Attendance } = require('../../db/models');
const router = express.Router();

const { Op } = require("sequelize");
const { check } = require('express-validator');

//get all events authentication false
router.get("/", async (req,res) => {
    let { page, size, name, type, startDate } = req.query;

    let errors = {};

    if(page != undefined)
    {
        if(page == "")
        errors.page = "Page must be number between 1 and 10 inclusive"
        else if(page < 1)
        errors.page = "Page must be greater than or equal to 1";
        else if(page > 10)
        errors.page = "Page must be less than or equal to 10";
    }
    if(size != undefined)
    {
        if(size == "")
        errors.size = "Size must be a number between 1 and 20 inclusive";
        else if(size < 1)
        errors.size = "Size must be greater than or equal to 1";
        else if(size > 20)
        errors.size = "Size must be less than or equal to 10";
    }
    if(name != undefined)
    {
        if(name.length == 0)
        errors.name = "Name must must be a non-empty string"
        // "5" == Number("5") is true but false for other strings, except the empty string
        else if(name == Number(name))
        errors.name = "Name must be a string";
    }
    if(type != undefined)
    {
        console.log(type)
        if(["Online", "In person"].includes(type) == false)
        {
            errors.type = "Type must be 'Online' or 'In person'";
        }
    }
    if(startDate != undefined)
    {
        let invalid = false;
        //startDate is a string, valid yyyy-mm-dd
        const arr = startDate.split("-");
        if(arr.length != 3) invalid = true;
        else if(arr[0].length != 4 || arr[1].length != 2 || arr[2].length != 2) invalid = true;
        //"05" == Number("05") is true, if string has letters or symbols, not true
        else if(arr[0] != Number(arr[0])) invalid = true;
        else if(arr[1] != Number(arr[1])) invalid = true;
        else if(arr[2] != Number(arr[2])) invalid = true;
        else if(Number(arr[0]) < 0) invalid = true;
        else if(Number(arr[1]) < 1 || Number(arr[1]) > 12) invalid = true;
        else if(Number(arr[2]) < 1 || Number(arr[2]) > 31) invalid = true;
        else if(Number(arr[1]) == 2 && Number(arr[2]) > 29) invalid = true;

        if(invalid) errors.startDate = "Start date must be a valid datetime (yyyy-mm-dd)";
    }
    if(Object.keys(errors).length != 0)
    {
        res.status(400);
        return res.json({
            message: "Bad Request",
            errors: errors
        })
    }
    //defaults 1 and 20 provided in the specs
    if(page == undefined) page = 1;
    if(size == undefined) size = 20;
    let pagination = {};
    pagination.limit = size;
    pagination.offset = size*(page - 1);

    let where = {};
    if(name != undefined) where.name = name;
    if(type != undefined) where.type = type;
    if(startDate != undefined)
    {
        where.startDate = {
            [Op.gte]: new Date(startDate)
        }
    }

    let allEvents = await Event.findAll({
        attributes: ["id", "groupId", "venueId", "name", "type", "startDate", "endDate"],
        ...pagination,
        where,
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

//get all attendees of an event specified by its id
//ORG/cohost sees all, not authorized only see non-pending
router.get("/:eventId/attendees", async (req, res) => {
    const { user } = req;
    const event = await Event.findByPk(req.params.eventId);
    if(event == null)
    {
        res.status(404);
        return res.json({ message: "Event couldn't be found"});
    }
    //don't requireAuth so we don't know if user is logged in
    if(user)
    {
        const authorized = await Membership.findOne({
            where: {
                groupId: event.groupId,
                userId: user.id,
                status: {
                    [Op.in]: ["co-host", "Organizer"]
                }
            }
        });
        //the user is co-host or Organizer
        if(authorized != null)
        {
            let attendees = await event.getUsers({
                attributes: ["id", "firstName", "lastName"]
            });
            attendees = attendees.map(ele => ele.toJSON());
            attendees.forEach(ele => {
                ele.Attendance = {
                    status: ele.Attendance.status
                }
            });
            return res.json({
                Attendees: attendees
            });
        }
    }
    //if the user is not logged in or is logged but not org/cohost
    let attendees = await event.getUsers({
        attributes: ["id", "firstName", "lastName"]
    });
    attendees = attendees.map(ele => ele.toJSON());
    attendees.forEach(ele => {
        ele.Attendance = {
            status: ele.Attendance.status
        }
    });
    attendees = attendees.filter(ele => ele.Attendance.status != "pending");
    return res.json({
        Attendees: attendees
    });
});

//Request to Attend an Event based on the Event's id
//requireAuth, authorization, user must be a member of the group
router.post("/:eventId/attendance", requireAuth, async (req, res) => {
    const event = await Event.findByPk(req.params.eventId);
    if(event == null)
    {
        res.status(404);
        return res.json({ message: "Event couldn't be found"});
    }
    const { user } = req;
    //user must be amember of the group
    const authorized = await Membership.findOne({
        where: {
           groupId: event.groupId,
           userId: user.id
        }
    });
    if(authorized == null)
    {
        res.status(403);
        return res.json({ message: "Forbidden"});
    }

    const isAnAttendee = await Attendance.findOne({
        where: {
            eventId: event.id,
            userId: user.id
        }
    });
    if(isAnAttendee == null)
    {
        await Attendance.create({
            eventId: event.id,
            userId: user.id,
            status: "pending"
        });
        return res.json({
            userId: user.id,
            status: "pending"
        })
    }
    const pendingAttendee = await Attendance.findOne({
        where: {
            eventId: event.id,
            userId: user.id,
            status: "pending"
        }
    });
    if(pendingAttendee != null)
    {
        res.status(400);
        return res.json({ message: "Attendance has already been requested"});
    }
    const acceptedAttendee = await Attendance.findOne({
        where: {
            eventId: event.id,
            userId: user.id,
            status: {
                [Op.ne]: "pending"
            }
        }
    });
    if(acceptedAttendee != null)
    {
        res.status(400);
        return res.json({ message: "User is already an attendee of the event"});
    }
});

//change the status of an attendance for an event specified by id
//user must be organizer or cohost
router.put("/:eventId/attendance", requireAuth, async (req,res) => {
    const event = await Event.findByPk(req.params.eventId);
    if(event == null)
    {
        res.status(404);
        return res.json({ message: "Event couldn't be found"});
    }
    const { user } = req;
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
    const { userId, status } = req.body;
    if(status == "pending")
    {
        res.status(400);
        return res.json({ message: "Cannot change an attendance status to pending" });
    }
    const findAttendance = await Attendance.findOne({
        where: {
            eventId: event.id,
            userId: userId//from req.body
        }
    });
    if(findAttendance == null)
    {
        res.status(404);
        return res.json({
            message: "Attendance between the user and the event does not exist"
        });
    }
    findAttendance.status = "attending";
    await findAttendance.save();
    return res.json({
        id: findAttendance.id,//something wrong ehre
        eventId: event.id,
        userId: userId,//from req.body
        status: "attending"
    })
});

//Delete an attendance to an eent specified by id
//usr must be the organizer or the use whose attendance is being deleted
router.delete("/:eventId/attendance", requireAuth, async (req, res) => {
    const event = await Event.findByPk(req.params.eventId);
    if(event == null)
    {
        res.status(404);
        return res.json({ message: "Event couldn't be found"});
    }
    const { user } = req;
    const { userId } = req.body;
    const organizer = await Membership.findOne({
        where: {
            groupId: event.groupId,
            userId: user.id,
            status: "Organizer"
        }
    });
    //the logged in user is not the organizer and
    //does not have the same id as the user to be deleted(userId)
    if(organizer == null && user.id != userId)
    {
        res.status(403);
        //return res.json({ message: "Forbidden"});
        return res.json({
            message: "Only the User or organizer may delete an Attendance"
        })
    }
    const findUserinDB = await User.findOne({
        where: {
            id: userId
        }
    });
    if(findUserinDB == null)
    {
        res.status(400);
        return res.json({
            message: "Validation Error",
            errors: {
                memberId: "User couldn't be found"
            }
        });
    }
    const findAttendance = await Attendance.findOne({
        where: {
            eventId: event.id,
            userId: userId
            //check the memberId not user.id
            //logged in user could be organizer
        }
    });
    if(findAttendance == null)
    {
        res.status(404);
        return res.json({ message: "Attendance does not exist for this User" })
    }

    await findAttendance.destroy();
    res.json({ message: "Successfully deleted attendance from event"})
});

module.exports = router;
