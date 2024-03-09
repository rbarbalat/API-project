const express = require('express');

const { requireAuth } = require('../../utils/auth');
const { Group, User, Membership, GroupImage, Venue, Event, EventImage } = require('../../db/models');
const router = express.Router();

const { singleFileUpload, singleMulterUpload } = require("../../awsS3");
const { Op } = require("sequelize");

//delete a groupimage, must be organizer or co-host
router.delete("/:imageId", requireAuth, async (req,res) => {
    const { user } = req;
    const image = await GroupImage.findByPk(req.params.imageId);
    if(image === null)
    {
        res.status(404);
        return res.json({ message: "Group Image couldn't be found"});
    }
    const authorized = await Membership.findOne({
        where: {
            groupId: image.groupId,
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
    await image.destroy();
    res.json({ message: "Successfully deleted"});
})

router.put("/:imageId", requireAuth, singleMulterUpload("image"), async (req,res) => {
    const { user } = req;
    const image = await GroupImage.findByPk(req.params.imageId);
    if(image === null)
    {
        res.status(404);
        return res.json({ message: "Group Image couldn't be found"});
    }
    const authorized = await Membership.findOne({
        where: {
            groupId: image.groupId,
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
    const url = req.file ? await singleFileUpload({ file: req.file, public: true }) : null;
    const { preview } = req.body;
    await image.set({
        preview,
        url
    })
    image.save();
    res.json({
        id: image.id,
        url: image.url,
        preview: image.preview
    });
})

module.exports = router;
