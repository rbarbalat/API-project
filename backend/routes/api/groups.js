const express = require('express');
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Group, User, Membership, GroupImage, Venue } = require('../../db/models');
const router = express.Router();

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

//put some error handling and authentication here?

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
            }
        ]
    });
    //console.log(Object.getOwnPropertyNames(User.prototype));
    //console.log(Object.getOwnPropertyNames(Group.prototype));
    //lazyLoad alternative version to get numMembers/prevImages
    //N+1 query loop and use .allGroups[i].countRegulars() and .getGroupImages()

    //eager load version
    allGroups = allGroups.map(ele => ele.toJSON());
    allGroups.forEach(async ele => {
        ele.numMembers = ele.Regulars.length;
        if(ele.GroupImages.length != 0) ele.previewImage = ele.GroupImages[0].url;
        else ele.previewImage = "";
        delete ele.Regulars;
        delete ele.GroupImages;
    });

    res.json({
        Groups: allGroups
    })
});

//Get all groups joined or organized by the Current User, authen = true
router.get("/current", async (req,res) => {
    const { user } = req;
    let allGroups;
    if(user)
    {

    }else{
        res.json({
            message: "Doesn't say in specs"
        })
    }
})

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
router.post("/", async (req,res) => {
    const { user } = req;
    const { name, about, type, private, city, state } = req.body;
    //if(!user) console.log("hello");
    if(user)
    {
        //this works but need to work on all the validators
        const newGroup = await user.createGroup({
            name,
            about,
            type,
            private,
            city,
            state
        });
        res.status(201);//201!!!!
        res.json(newGroup);
    }
});

//Add an image to a group based on Group's id, authent true
router.post("/:groupId/images", async (req,res) => {})

//Edit a group, authent true
router.post("/:groupdId", async (req,res) => {
    const { user } = req;
    //check if the group exists,
    //check if the user is the organizer of the group
    if(user)
    {

    }
});

//Delete a group, authent = true
router.delete("/:groupdId", async (req,res) => {
    //seems to work
    const { user } = req;
    let group = await Group.findByPk(req.params.groupdId);
    if(user && group ) {
        const organizer = await group.getOrganizer();
        if(user.id == organizer.id)
        {
            await group.destroy();
            return res.json({
                message: "Successfully deleted"
            });
        }
    }
    res.status(404);
    res.json({
        message: "Group couldn't be found"
    })
})

// const validateSignup =
// [
//     check('email').exists({ checkFalsy: true }).isEmail()
//     .withMessage('Please provide a valid email.'),

//     check('username').exists({ checkFalsy: true }).isLength({ min: 4 })
//     .withMessage('Please provide a username with at least 4 characters.'),

//     check('username').not().isEmail()
//     .withMessage('Username cannot be an email.'),

//     check('password').exists({ checkFalsy: true })
//     .isLength({ min: 6 }).withMessage('Password must be 6 characters or more.'),

//     handleValidationErrors
// ];

module.exports = router;
