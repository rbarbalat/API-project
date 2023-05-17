const express = require('express');
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Group, User, Membership, GroupImage, Venue } = require('../../db/models');
const router = express.Router();

const { Op } = require("sequelize");

//requireAuth and organizer/co-host
router.put("/:venueId", requireAuth, async (req, res) => {
    const { user } = req;
    const venue = await Venue.findByPk(req.params.venueId);
    if(venue == null)
    {
        res.status(404);
        return res.json({ message: "Venue couldn't be found"});
    }
    //an existing venue must have a groupId foreignKey
    const authorized = await Membership.findOne({
        where: {
            groupId: venue.groupId,
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
    await venue.set({
        address,
        city,
        state,
        lat,
        lng
    });
    await venue.save();
    const venueObject = venue.toJSON();
    delete venueObject.createdAt;
    delete venueObject.updatedAt;
    res.json(venueObject);
});

module.exports = router;
