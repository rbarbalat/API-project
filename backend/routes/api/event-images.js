const express = require('express');

const { requireAuth } = require('../../utils/auth');
const { Group, User, Membership, GroupImage, Venue, Event, EventImage } = require('../../db/models');
const router = express.Router();

const { Op } = require("sequelize");

router.delete("/:imageId", requireAuth, async (req, res) => {
    const { user } = req;
    const image = await EventImage.findByPk(req.params.imageId);
    if(image === null)
    {
        res.status(404);
        return res.json({ message: "Event Image couldn't be found"});
    }
    const event = await image.getEvent();
    const authorized = await Membership.findOne({
        where: {
            groupId: event.groupId,
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
});

module.exports = router;
