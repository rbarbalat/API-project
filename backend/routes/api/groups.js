const express = require('express');
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Group, User, Membership, GroupImage, Venue, Event } = require('../../db/models');
const router = express.Router();

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { Op } = require("sequelize");

//put some error handling and authentication here?

//DONEZO, CHECK PRODUCTION?
//GET all groups, authentication = false
router.get("/", async (req, res) => {
    let allGroups = await Group.findAll({
        include:
        [
            {
                model: GroupImage,
                attributes: {
                    include: ["url"]
                },
                where: {
                    preview: true
                },
                required: false
            },
        ]
    });
    //console.log(Object.getOwnPropertyNames(Group.prototype));

    const numMembers = [];
    //I used an eager load alternative in groups by ID, refactor later
    for(let i = 0; i<allGroups.length; i++)
    {
        numMembers.push(await allGroups[i].countMemberships(
            {
                where: {
                    status:{
                        [Op.ne]: "pending"
                    }
                }
            }
        ));
        allGroups[i] = allGroups[i].toJSON();
        allGroups[i].numMembers = numMembers[i];
    }

    //there is .getGroupImages() lazy load alternative
    allGroups.forEach(async ele => {
        if(ele.GroupImages.length != 0) ele.previewImage = ele.GroupImages[0].url;
        else ele.previewImage = "no preview image available";
        delete ele.GroupImages;
    });

    res.json({
        Groups: allGroups
    })
});

//Get all groups joined or organized by the Current User, authen = true
router.get("/current", requireAuth, async (req,res) => {
    const { user } = req;
    //this is terrible but works for now, except for getting numMembers and image
    let allGroups = await Group.findAll({
        include: [
                    {
                        model: User,
                        as: "Regulars",
                        where: {
                           id: user.id
                        }
                    },
                    {
                        model: GroupImage,
                        attributes: {
                            include: ["url"]
                        },
                        where: {
                            preview: true
                        },
                        required: false
                    },
                 ]
    })
    const numMembers = [];
    //I used an eager load alternative in groups by ID, refactor later
    for(let i = 0; i<allGroups.length; i++)
    {
        numMembers.push(await allGroups[i].countMemberships(
            {
                where: {
                    status:{
                        [Op.ne]: "pending"
                    }
                }
            }
        ));
        allGroups[i] = allGroups[i].toJSON();
        allGroups[i].numMembers = numMembers[i];
        delete allGroups[i].Regulars;
    }
    allGroups.forEach(async ele => {
        if(ele.GroupImages.length != 0) ele.previewImage = ele.GroupImages[0].url;
        else ele.previewImage = "no preview image available";
        delete ele.GroupImages;
    });

    res.json({
        Groups: allGroups
    });
})

//DONEZO? CHECK PRODUCTION
//Get details of a group from an Id, authentication = false
router.get("/:groupdId", async(req, res) => {
    if(Number(req.params.groupdId) != req.params.groupdId)
    {
        res.status(404);
        return res.json({
            message: "Group couldn't be found"
        })
    }
    let group = await Group.findOne({
        where: {
            id: req.params.groupdId
        },
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
                        where: {
                            status: {
                                [Op.ne]: "pending"
                            }
                        },
                        required: false
                    }
                 ]
    });
    if(group == null){
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
    //user exists since already Authenticated

    const newGroup = await user.createGroup({
        name,
        about,
        type,
        private,
        city,
        state
    });
    //add the organizer/newGroup combo to the memberships table
    //need to check that this works
    const newMember = await Membership.create({
        userId: user.id,
        groupId: newGroup.id,
        status: "Organizer",
        memberId: 1
    });
    console.log(newMember);
        res.status(201);//201!!!!
        res.json(newGroup);
});

//Add an image to a group based on Group's id, authent true, ORGANIZER ONLY
//ADD VALIDATIONS ON URL/PREVIEW FROM REQ BODY?
router.post("/:groupId/images", requireAuth, async (req,res) => {
    const group = await Group.findByPk(req.params.groupId);
    if(group == null){
        res.status(404);
        return res.json({message: "Group couldn't be found"});
    }
    const { user } = req;
    if(group.organizerId != user.id){
        res.status(403);
        return res.json({message: "Forbidden"});
    }
    const {url , preview} = req.body;
    //do I have to validate url and preview?
    let image = await group.createGroupImage({
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
    if(group == null)
    {
        res.status(404);
        return res.json({message: "Group couldn't be found"})
    }
    if(group.organizerId != user.id)
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
    if(group == null)
    {
        res.status(404);
        return res.json({ message: "Group couldn't be found" })
    }
    if(user.id != group.organizerId )
    {
        res.status(403);
        return res.json({ message: "Forbidden"});
    }
    //should cascade to the memberships and other tables..
    await group.destroy();
    return res.json({ message: "Successfully deleted" });
})

//may have to reorder the route handlers based on specificty later

//GET all venues for a group based on ID, requireAuth, organizer or co-host
router.get("/:groupId/venues", requireAuth, async (req,res) => {
    const { user } = req;
    const group = await Group.findByPk(req.params.groupId);
    if(group == null)
    {
        res.status(404);
        return res.json({ message: "Group couldn't be found"});
    }
    //try to find the logged in user in the member table w/ the right group and status
    const authorized = await Membership.findOne({
        where: {
            groupId: group.id,
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
    const allVenues = await Venue.findAll({
        where: {
            groupId: group.id
        },
        attributes: {
            exclude: ["createdAt", "updatedAt"]
        }
    })
    res.json(allVenues);
});

//add venue validators and good
//Create a new venue for a group specified by its id, authent, org/cohost
router.post("/:groupId/venues", requireAuth, async (req,res) => {
    const { user } = req;
    const group = await Group.findByPk(req.params.groupId);
    if(group == null)
    {
        res.status(404);
        return res.json({ message: "Group couldn't be found"});
    }
    //try to find the logged in user in the member table w/ the right group and status
    const authorized = await Membership.findOne({
        where: {
            groupId: group.id,
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
    res.json(newVenue);
});

//Create an Event for a Group specified by its id, authent, organizer/cohost
//need body validation errors
router.post("/:groupId/events", requireAuth, async (req,res) => {
    const { user } = req;
    const group = await Group.findByPk(req.params.groupId);
    if(group == null)
    {
        res.status(404);
        return res.json({ message: "Group couldn't be found"});
    }
    //try to find the logged in user in the member table w/ the right group and status
    const authorized = await Membership.findOne({
        where: {
            groupId: group.id,
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
    //console.log(Object.getOwnPropertyNames(Group.prototype));
    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body;

    //becareful there is also .createEvenue which is a belongsToMany assoc with an alias
    const newEvent = await group.createEvent({
        venueId,
        name,
        type,
        capacity,
        price,
        description,
        startDate,
        endDate
    });
    res.json(newEvent);
});

//Get all events of a group specified by its id, authen false
router.get("/:groupId/events", async (req, res) => {
    const group = await Group.findByPk(req.params.groupId);
    if(group == null)
    {
        res.status(404);
        return res.json({ message: "Group couldn't be found"});
    }
    const allEvents = await Event.findAll({
        where: {
            groupId: group.id,
        },
        attributes: {
            exclude: ["createdAt", "updatedAt"]
        },
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
    const numAttending = [];
    const prevImages = [];
    for(let i = 0; i<allEvents.length; i++)
    {
        numAttending.push(await allEvents[i].countAttendances({
            where: {
                status: "attending"
            }
        }));
        const images = await allEvents[i].getEventImages({
            where: {
                preview: true
            }
        });
        if(images.length == 0) prevImages.push("No preview image");
        else prevImages.push(images[0].url);

        allEvents[i] = allEvents[i].toJSON();
        //add the properties to the newly created POJO
        allEvents[i].numAttending = numAttending[i];
        allEvents[i].previewImage = prevImages[i];
    }
    //console.log(Object.getOwnPropertyNames(Event.prototype));

    res.json({
        Events: allEvents
    })
});

//Get all Members of a Group specified by its id, authent false
router.get("/:groupId/members", async (req, res) => {
    const group = await Group.findByPk(req.params.groupId);
    if(group == null)
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
        if(authorized != null)
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
    if(group == null)
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
    if(inTheGroup == null)
    {
        //create a pending member
        await Membership.create({
            userId: user.id,
            groupId: group.id,
            status: "pending",
            //memberId: deal witht his later on my own time
        })
        return res.json({
            //memberId in the response refers to the users id from Users table!!!
            //I have a memberId column
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
    if(pendingMember != null)
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
    if(acceptedMember != null)
    {
        res.status(400);
        return res.json({ message: "User is already a member of the group"});
    }
});

//change the status of a membership for a group specified by id
router.put("/:groupId/membership", requireAuth, async (req, res) => {
    const group = await Group.findByPk(req.params.groupId);
    if(group == null)
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
    //check if the user exists in the database (users table)
    const findUserToBeChanged = await User.findOne({
        where: {
            //the memberId in the req body refers to the users userId
            //not to my memberId column that isn't necessary
            userId: memberId
        }
    });
    if(findUserToBeChanged == null)
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
            //memberId from req body refers to user's id from the users table
            userId: memberId,
            groupId: group.id
        }
    });
    if(findMembership == null)
    {
        res.status(404);
        return res.json({
            message: "Membership between the user and the group does not exist"
        })
    }

    if(status == "pending")
    {
        res.status(400);
        return res.json({
            message: "Validation Error",
            errors: {
                status: "Cannot change a membership status to pending"
            }
        });
    }
    //findMembership from above is not null and req.user is authent as eitehr cohost or organizer
    if(status == "member")
    {
        if(findMembership.status == "pending")
        {
            findMembership.status = "member";
            await findMembership.save();
            return res.json({
                memberId: memberId,//memberId is from req.body (user's id from users table)
                status: "member"
            });
        }
    }
    if(status == "co-host" && organizer != null)
    {
        if(findMembership.status = "member")
        {
            findMembership.status = "co-host";
            await findMembership.save();
            return res.json({
                memberId: memberId,//memberId is from req.body (user's id from users table)
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
    if(group == null)
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
    if(organizer == null && user.id != memberId)
    {
        res.status(403);
        return res.json({ message: "Forbidden"});
    }
    const findUserinDB = await User.findOne({
        where: {
            id: memberId
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
    const findMembership = await Membership.findOne({
        where: {
            groupId: group.id,
            userId: memberId
            //check the memberId not user.id
            //logged in user could be organizer
        }
    });
    if(findMembership == null)
    {
        res.status(404);
        return res.json({ message: "Membership does not exist for this User" })
    }

    await findMembership.destroy();
    res.json({ message: "Successfully deleted membership from group"})
});

module.exports = router;
