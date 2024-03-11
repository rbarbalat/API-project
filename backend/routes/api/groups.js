const express = require('express');
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Group, User, Membership, GroupImage, Venue, Event } = require('../../db/models');
const router = express.Router();

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { singleFileUpload, singleMulterUpload } = require("../../awsS3");

const { Op } = require("sequelize");

/*
    Per the specs,
    where memberId appears in the request body or response object
    it refers to the id (PK) in the users table
*/

// get all groups, auth not required
router.get("/", async (req, res) => {
    let allGroups = await Group.findAll({
        include:
        [
            {
                model: GroupImage,
                attributes: ["url"],
                where: { preview: true },
                required: false
            },
            {
                model: Membership,
                attributes: ["id"],
                where: {
                    status: {
                        [Op.ne]: "pending"
                    }
                },
                required: false
            }
        ]
    });

    for(let i = 0; i<allGroups.length; i++)
    {
        allGroups[i] = allGroups[i].toJSON();
        allGroups[i].numMembers = allGroups[i].Memberships.length;
        delete allGroups[i].Memberships;
    }

    allGroups.forEach(ele => {
        if(ele.GroupImages.length != 0)
            ele.previewImage = ele.GroupImages[0].url;
        else
            ele.previewImage = "no preview image available";

        delete ele.GroupImages;
    });

    res.json({
        Groups: allGroups
    })
});

//Get all groups joined or organized by the logged in user, auth required
router.get("/current", requireAuth, async (req,res) => {
    const { user } = req;
    /*
        the where clause inside Memberships is necessary to filter for the right groups
        but each group's Memberships array will only contain the current user's Membership
        can't use the length of the Memberships array to get the numMembers as in GET /groups

        1)can call countMemberships on each group (n+1 queries)
        OR
        2)include the User's model which will attach an array to each group holding ALL users in the group
        each user instance has a Membership key whose value is an object with a status key
        filter the array to exclude pending statuses and then numMembers = length of filtered array
    */
    let allGroups = await Group.findAll({
        include: [
                    // {
                    //     model: User,
                    //     as: "Regulars",
                    //     attributes: ["id"]
                    // },
                    {
                        model: GroupImage,
                        attributes: ["url"],
                        where: { preview: true },
                        required: false
                    },
                    {
                        model: Membership,
                        where: {
                            userId: user.id,
                            status:{
                                [Op.ne]: "pending"
                            }
                        }
                    }
                 ]
    })

    //Filter version, restore the User model in the query above
    /*
    for(let i = 0; i<allGroups.length; i++)
    {
        allGroups[i] = allGroups[i].toJSON();
        let counter = 0;
        allGroups[i].Regulars.forEach(user => {
            if(user.Membership.status !== "pending") counter += 1
        });
        allGroups[i].numMembers = counter;
        delete allGroups[i].Regulars;
        delete allGroups[i].Memberships;
    }
    */

    /*
        n+1 queries version
        if users are in few groups, and groups are very large
        this probably better than filtering
    */

    for(let i = 0; i<allGroups.length; i++)
    {
        const numMembers = await allGroups[i].countMemberships({
            where:{
                status:{
                    [Op.ne]: "pending"
                }
            }
        });

        allGroups[i] = allGroups[i].toJSON();
        allGroups[i].numMembers = numMembers;
        delete allGroups[i].Memberships;
    }

    allGroups.forEach(ele => {
        if(ele.GroupImages.length != 0)
            ele.previewImage = ele.GroupImages[0].url;
        else
            ele.previewImage = "no preview image available";

        delete ele.GroupImages;
    });

    res.json({
        Groups: allGroups
    });
})

router.get("/:groupdId", async(req, res) => {
    if(Number(req.params.groupdId) != req.params.groupdId)
    {
        res.status(404);
        return res.json({
            message: "Group couldn't be found"
        })
    }
    let group = await Group.findOne({
        where: { id: req.params.groupdId },
        include: [
                    {
                        model: User,
                        as: "Organizer",
                        attributes: ["id", "firstName", "lastName"]
                    },
                    {
                       model: GroupImage,
                       attributes: ["id", "url", "preview"]
                    },
                    {
                        model: Venue,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        }
                    },
                    {
                        model: Membership,
                        attributes: ["id"],
                        where: {
                            status: {
                                [Op.ne]: "pending"
                            }
                        },
                        required: false
                    }
                 ]
    });

    if(group === null)
    {
        res.status(404);
        return res.json({
            message: "Group couldn't be found"
        })
    }
    group = group.toJSON();
    group.numMembers = group.Memberships.length;
    delete group.Memberships;

    res.json(group);
});

//Create a group, authent = true
router.post("/", requireAuth, async (req,res) => {
    const { user } = req;
    const { name, about, type, private, city, state } = req.body;

    const newGroup = await user.createGroup({
        name,
        about,
        type,
        private,
        city,
        state
    });

    const newMember = await Membership.create({
        userId: user.id,
        groupId: newGroup.id,
        status: "Organizer"
    });

    res.status(201);
    res.json(newGroup);
});

//Add an image to a group based on Group's id, authent true, ORGANIZER ONLY
router.post("/:groupId/images", requireAuth, singleMulterUpload("image"), async (req,res) => {
    const group = await Group.findByPk(req.params.groupId);
    if(group === null)
    {
        res.status(404);
        return res.json({message: "Group couldn't be found"});
    }
    const { user } = req;
    if(group.organizerId !== user.id){
        res.status(403);
        return res.json({message: "Forbidden"});
    }
    const url = req.file ? await singleFileUpload({ file: req.file, public: true }) : null;
    const { preview } = req.body;
    const image = await group.createGroupImage({
        url,
        preview
    });
    res.json({
        id: image.id,
        url: image.url,
        preview: image.preview
    });

})

//Edit a group, authent true, authorized true, ORGANIZER ONLY
router.put("/:groupdId", requireAuth, async (req,res) => {
    const { user } = req;
    let group = await Group.findByPk(req.params.groupdId);
    if(group === null)
    {
        res.status(404);
        return res.json({message: "Group couldn't be found"})
    }
    if(group.organizerId !== user.id)
    {
        res.status(403);
        return res.json({message: "Forbidden"})
    }
    const { name, about, type, private, city, state } = req.body;
    await group.set({
        name,
        about,
        type,
        private,
        city,
        state
    })
    await group.save();
    res.json(group);
});

//Delete a group, authent = true, authorization true, ORGANIZER ONLY
router.delete("/:groupdId", requireAuth, async (req,res) => {
    //seems to work
    const { user } = req;
    let group = await Group.findByPk(req.params.groupdId);
    if(group === null)
    {
        res.status(404);
        return res.json({ message: "Group couldn't be found" })
    }
    if(user.id !== group.organizerId)
    {
        res.status(403);
        return res.json({ message: "Forbidden"});
    }
    await group.destroy();
    return res.json({ message: "Successfully deleted" });
})

//GET all venues for a group based on ID, requireAuth (organizer or co-host)
router.get("/:groupId/venues", requireAuth, async (req,res) => {
    const { user } = req;
    const group = await Group.findByPk(req.params.groupId);
    if(group === null)
    {
        res.status(404);
        return res.json({ message: "Group couldn't be found"});
    }

    const authorized = await Membership.findOne({
        where: {
            groupId: group.id,
            userId: user.id,
            status: {
                [Op.in]: ["co-host", "Organizer"]
            }
        }
    });
    if(authorized === null)
    {
        res.status(403);
        return res.json({ message: "Forbidden"});
    }
    const allVenues = await Venue.findAll({
        where: { groupId: group.id },
        attributes: {
            exclude: ["createdAt", "updatedAt"]
        }
    })

    res.json({
        Venues: allVenues
    });
});

//Create a new venue for a group specified by its id, requireAuth organizer or co-host
router.post("/:groupId/venues", requireAuth, async (req,res) => {
    const { user } = req;
    const group = await Group.findByPk(req.params.groupId);
    if(group === null)
    {
        res.status(404);
        return res.json({ message: "Group couldn't be found"});
    }

    const authorized = await Membership.findOne({
        where: {
            groupId: group.id,
            userId: user.id,
            status: {
                [Op.in]: ["co-host", "Organizer"]
            }
        }
    });
    if(authorized === null)
    {
        res.status(403);
        return res.json({ message: "Forbidden"});
    }
    const { address, city, state, lat, lng } = req.body;
    let newVenue = await group.createVenue({
        address,
        city,
        state,
        lat,
        lng
    });

    newVenue = newVenue.toJSON();
    delete newVenue.createdAt;
    delete newVenue.updatedAt;

    res.status(201);
    res.json(newVenue);
});

//Create an Event for a Group specified by its id, authent, organizer/cohost
router.post("/:groupId/events", requireAuth, async (req,res) => {
    const { user } = req;
    const group = await Group.findByPk(req.params.groupId);
    if(group === null)
    {
        res.status(404);
        return res.json({ message: "Group couldn't be found"});
    }

    const authorized = await Membership.findOne({
        where: {
            groupId: group.id,
            userId: user.id,
            status: {
                [Op.in]: ["co-host", "Organizer"]
            }
        }
    });
    if(authorized === null)
    {
        res.status(403);
        return res.json({ message: "Forbidden"});
    }

    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body;

    //null is a valid value for the venueId field in the request body
    //the venueId field may be excluded for the request (in that case venueId will be undefined)
    if( ![null, undefined].includes(venueId) && isNaN(parseInt(venueId)))
    {
        res.status(404);
        return res.json({message: "Venue couldn't be found"});
    }
    if(parseInt(venueId))
    {
        const findVenue = await Venue.findByPk(venueId);
        if(findVenue === null)
        {
            res.status(404);
            return res.json({message: "Venue couldn't be found"});
        }
    }

    //an attendance is NOT created for the organizer or co-host who created the Event
    //numAttending for the new event starts at 0
    let newEvent = await group.createEvent({
        venueId: (venueId === undefined) ? null : venueId,
        name,
        type,
        capacity,
        price,
        description,
        startDate,
        endDate
    });
    newEvent = newEvent.toJSON();
    delete newEvent.createdAt;
    delete newEvent.updatedAt;

    res.json(newEvent);
});

//Get all events of a group specified by its id, authen false
router.get("/:groupId/events", async (req, res) => {
    const group = await Group.findByPk(req.params.groupId);
    if(group === null)
    {
        res.status(404);
        return res.json({ message: "Group couldn't be found"});
    }
    const allEvents = await Event.findAll({
        where: { groupId: group.id },
        attributes: { exclude: ["createdAt", "updatedAt"] },
        include: [
                    {
                        model: Group,
                        attributes: ["id", "name", "city", "state"]
                    },
                    {
                        model: Venue,
                        attributes: ["id", "city", "state"]
                    }
                 ]
    });

    for(let i = 0; i<allEvents.length; i++)
    {
        const numAttending = await allEvents[i].countAttendances({
            where: { status: "attending" }
        });

        const images = await allEvents[i].getEventImages({
            where: { preview: true }
        });

        const prevImage = (images.length === 0) ? "No preview image" : images[0].url

        allEvents[i] = allEvents[i].toJSON();
        allEvents[i].numAttending = numAttending;
        allEvents[i].previewImage = prevImage;
    }

    res.json({
        Events: allEvents
    })
});

//Get all Members of a Group specified by its id, authent false
router.get("/:groupId/members", async (req, res) => {
    const group = await Group.findByPk(req.params.groupId);
    if(group === null)
    {
        res.status(404);
        return res.json({ message: "Group couldn't be found"});
    }
    const { user } = req;
    //does not requireAuth so we don't know if user is defined (logged in)
    if(user)
    {
        const authorized = await Membership.findOne({
            where: {
                groupId: group.id,
                userId: user.id,
                status: {
                    [Op.in]: ["co-host", "Organizer"]
                }
            }
        });
        //the user is co-host or Organizer
        if(authorized !== null)
        {
            let members = await group.getRegulars({
                attributes: ["id", "firstName", "lastName"]
            });
            members = members.map(ele => ele.toJSON());
            members.forEach(ele => {
                ele.Membership = {
                    status: ele.Membership.status
                }
            });
            return res.json({
                Members: members
            });
        }
    }
    //not a logged in or logged in but not cohost/organizer
    let members = await group.getRegulars({
        attributes: ["id", "firstName", "lastName"]
    });
    members = members.map(ele => ele.toJSON());
    members.forEach(ele => {
        ele.Membership = {
            status: ele.Membership.status
        }
    });
    members = members.filter(ele => ele.Membership.status != "pending");
    return res.json({
        Members: members
    });
});

//request a membership for a group based on the gorup's id, requireAuth
router.post("/:groupId/membership", requireAuth, async (req,res) => {
    const group = await Group.findByPk(req.params.groupId);
    if(group === null)
    {
        res.status(404);
        return res.json({ message: "Group couldn't be found"});
    }
    const { user } = req;

    const inTheGroup = await Membership.findOne({
        where: {
            groupId: group.id,
            userId: user.id
        }
    })
    if(inTheGroup === null)
    {
        await Membership.create({
            userId: user.id,
            groupId: group.id,
            status: "pending",
        })
        return res.json({
            memberId: user.id,
            status: "pending"
        })
    }
    const pendingMember = await Membership.findOne({
        where: {
            groupId: group.id,
            userId: user.id,
            status: "pending"
        }
    });
    if(pendingMember !== null)
    {
        res.status(400);
        return res.json({ message: "Membership has already been requested"});
    }
    const acceptedMember = await Membership.findOne({
        where: {
            groupId: group.id,
            userId: user.id,
            status: {
                [Op.ne]: "pending"
            }
        }
    });
    if(acceptedMember !== null)
    {
        res.status(400);
        return res.json({ message: "User is already a member of the group"});
    }
});

//change the status of a membership for a group specified by id
router.put("/:groupId/membership", requireAuth, async (req, res) => {
    const group = await Group.findByPk(req.params.groupId);
    if(group === null)
    {
        res.status(404);
        return res.json({ message: "Group couldn't be found"});
    }
    const { user } = req;
    const organizer = await Membership.findOne({
        where: {
            groupId: group.id,
            userId: user.id,
            status: "Organizer"
        }
    });
    const coHost = await Membership.findOne({
        where: {
            groupId: group.id,
            userId: user.id,
            status: "co-host"
        }
    });
    if( !organizer && !coHost)
    {
        res.status(403);
        return res.json({ message: "Forbidden"});
    }

    const { memberId, status } = req.body;
    const findUserToBeChanged = await User.findOne({
        where: { id: memberId }
    });
    if(findUserToBeChanged === null)
    {
        res.status(400);
        return res.json({
            message: "Validation Error",
            errors: {
                memberId: "User couldn't be found"
            }
        })
    }

    const findMembership = await Membership.findOne({
        where: {
            userId: memberId,
            groupId: group.id
        }
    });
    if(findMembership === null)
    {
        res.status(404);
        return res.json({
            message: "Membership between the user and the group does not exist"
        })
    }

    if(status === "pending")
    {
        res.status(400);
        return res.json({
            message: "Validation Error",
            errors: {
                status: "Cannot change a membership status to pending"
            }
        });
    }
    //findMembership from above is not null and req.user is authent as either a cohost or organizer
    if(status === "member")
    {
        if(findMembership.status === "pending")
        {
            findMembership.status = "member";
            await findMembership.save();
            return res.json({
                id: findMembership.id,
                groupId: group.id,
                memberId: memberId,
                status: "member"
            });
        }
    }
    if(status === "co-host" && organizer != null)
    {
        if(findMembership.status === "member")
        {
            findMembership.status = "co-host";
            await findMembership.save();
            return res.json({
                id: findMembership.id,
                groupId: group.id,
                memberId: memberId,
                status: "co-host"
            });
        }
    }
    return res.json({message: "Edge Case"});
});

//Delete a Membership for a group based on its id, require authent,
//req.user must be the organizer or the user to be deleted from the group
router.delete("/:groupId/membership", requireAuth, async (req, res) => {
    const group = await Group.findByPk(req.params.groupId);
    if(group === null)
    {
        res.status(404);
        return res.json({ message: "Group couldn't be found"});
    }
    const { user } = req;
    const { memberId } = req.body;
    const organizer = await Membership.findOne({
        where: {
            groupId: group.id,
            userId: user.id,
            status: "Organizer"
        }
    });
    //logged in user is not the organizer or the user to be deleted
    if(organizer === null && user.id != memberId)
    {
        res.status(403);
        return res.json({ message: "Forbidden"});
    }
    const findUserinDB = await User.findOne({
        where: { id: memberId }
    });
    if(findUserinDB === null)
    {
        res.status(400);
        return res.json({
            message: "Validation Error",
            errors: {
                memberId: "User couldn't be found"
            }
        });
    }
    const findMembership = await Membership.findOne({
        where: {
            groupId: group.id,
            userId: memberId
        }
    });
    if(findMembership === null)
    {
        res.status(404);
        return res.json({ message: "Membership does not exist for this User" })
    }

    await findMembership.destroy();
    res.json({ message: "Successfully deleted membership from group"})
});

module.exports = router;
