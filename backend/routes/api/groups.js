const express = require('express');
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Group, User, Membership, GroupImage, Venue } = require('../../db/models');
const router = express.Router();

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

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
    console.log(Object.getOwnPropertyNames(Group.prototype));
    //lazyLoad alternative version to get numMembers/prevImages
    //N+1 query loop and use .allGroups[i].countRegulars() and .getGroupImages()

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

//put sign up validations here, similar to user creation validations
//Create a group, authent = true, this does create a group but does not add organier to Memberships
router.post("/", requireAuth, async (req,res) => {
    const { user } = req;
    const { name, about, type, private, city, state } = req.body;
    //user exists since already Authenticated

    //ADD ERROR RESPONSE: BODY VALIDATION ERROR, 400

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
});

//Add an image to a group based on Group's id, authent true, authoriz must be organizer
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

//need validators
//Edit a group, authent true, authorized true, organizer
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
    //if(validations fail)
    // {
    //     res.status(400);
    //     return res.json();
    // }
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

//PASSED DEVELOPMENT, TEST PRODUCTION
//Delete a group, authent = true, authorization true, organizer
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
    await group.destroy();
    return res.json({ message: "Successfully deleted" });
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
