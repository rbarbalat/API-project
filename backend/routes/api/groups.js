const express = require('express');
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Group, User } = require('../../db/models');
const router = express.Router();

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

//put some error handling and authentication here?

//GET all groups, authentication = false
router.get("/", async (req, res) => {
    let allGroups = await Group.findAll();
    //include memberships to get an array of members
    //then get the length of that array or there is an assoc function(N+1)
    //include group images where preview:true
    //loop through allGroups and apply .toJSON
    //add properties of numMembers andn preview image to each ele
    allGroups.forEach(ele => {
        ele = ele.toJSON();
        ele.numMembers = 10;
    })
    res.json({
        Groups: allGroups
    })
});

//Get all groups joined or organized by the Current User, authen = true

//Get details of a group from an Id, authentication = false
router.get("/:groupdId", async(req, res) => {
    //maybe some checks to see if it was a valid type
    let group = await Group.findOne({
        where: {
            id: req.params.groupdId
        },
        //include: "Organizer"
        include: {
            model: User,
            as: "Organizer",
            //can scope this later
            attributes: ["id", "firstName", "lastName"]
        }
        //need to include venues and group images as well
        //include: [{}, {}, {}]
    });
    if(group == null){
        res.status(404);
        return res.json({
            message: "Group couldn't be found"
        })
    }
    res.json(group);
})

//Create a group, authent = true
router.post("/", async (req,res) => {});

//Add an image to a group based on Group's id, authent true
router.post("/:groupId/images", async (req,res) => {})

//Edit a group, authent true
router.post("/:groupdId", async (req,res) => {});

//Delete a group, authent = true
router.delete("/:groupdId", async (req,res) => {})

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
