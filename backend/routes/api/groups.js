const express = require('express');
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Group, User, Membership, GroupImage, Venue } = require('../../db/models');
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
                model: User,
                as: "Regulars"
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
    });
    //console.log(Object.getOwnPropertyNames(User.prototype));
    //console.log(Object.getOwnPropertyNames(Group.prototype));
    //lazyLoad alternative version, also have .getGroupImages()
    const countRegs = [];
    for(let i = 0; i<allGroups.length; i++)
    {
        countRegs.push(await allGroups[i].countRegulars());
    }
    //console.log(countRegs);

    //eager load version
    allGroups = allGroups.map(ele => ele.toJSON());
    allGroups.forEach(async ele => {
        //if things aren't seeded properly might have to add 1 if organizer not counted...
        ele.numMembers = ele.Regulars.length;
        if(ele.GroupImages.length != 0) ele.previewImage = ele.GroupImages[0].url;
        else ele.previewImage = "no preview image available";
        delete ele.Regulars;
        delete ele.GroupImages;
    });

    //testing
    // const memberships = await Membership.findAll();
    // console.log(memberships);
    res.json({
        Groups: allGroups
    })
});

//Get all groups joined or organized by the Current User, authen = true
router.get("/current", requireAuth, async (req,res) => {
    const { user } = req; //user is defined b/c passed through reqAuth
    //this is terrible but works for now, except for getting numMembers and image
    let orgGroups = await user.getGroups();
    let memGroups = await Group.findAll({
        include: [
                    {
                        model: User,
                        as: "Regulars",
                        where: {
                           id: user.id
                        }
                    }
                 ]
    })
    orgGroups = orgGroups.map(ele => ele.toJSON());
    memGroups = memGroups.map(ele => ele.toJSON());
    memGroups.forEach(ele => delete ele.Regulars);
    let allGroups = [...orgGroups, ...memGroups];
    let uniqueGroups = new Set();
    allGroups.forEach(ele => uniqueGroups.add(ele));

    // possible alternative way
    // let diffMembers = await Membership.findAll({
    //     where: {
    //         userId: user.id
    //     },
    //     //include: Group, need an assoc or through User?
    // })
    //res.json(diffMembers)
    //console.log(Object.getOwnPropertyNames(User.prototype));
    //console.log(await user.countGroups());
    res.json({
        Groups: [...uniqueGroups]//still need to add numMembers and prevImage properties
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
        //need to include Venues and GroupImages as well (instead of prevImage)
        include: [
                    {
                        model: User,
                        as: "Organizer",
                        attributes: ["id", "firstName", "lastName"]
                    },
                    {
                        model: User,
                        as: "Regulars"
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
    group.numMembers = group.Regulars.length;
    delete group.Regulars;
    res.json(group);

    // let allMemberships = await Membership.findAll();
    // res.json(allMemberships);
})

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
    const newVenue = await group.createVenue({
        address,
        city,
        state,
        lat,
        lng
    });
    res.json(newVenue);
})


module.exports = router;
