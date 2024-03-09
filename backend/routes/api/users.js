const express = require('express');
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');
const router = express.Router();

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');


const validateSignup =
[

    check('email').isEmail()
    .withMessage('The provided email is invalid.'),

    check('username').isLength({ min: 4 })
    .withMessage('Please provide a username with at least 4 characters.'),

    check('username').isLength({ max: 30 })
    .withMessage('Please provide a username with at most 30 characters.'),

    check('username').not().isEmail()
    .withMessage('Please provide a username that is not an email.'),

    check('firstName').isLength({ min: 1 })
    .withMessage('Please provide a first name with at least 1 character.'),

    check("firstName").isLength({ max: 30 })
    .withMessage('First name can be at most 30 characters.'),

    check('lastName').isLength({ min: 1 })
    .withMessage('Please provide a last name with at least 1 character.'),

    check("lastName").isLength({ max: 30 })
    .withMessage('Last name can be at most 30 characters.'),

    check('password').exists({ checkFalsy: true })
    .isLength({ min: 6 }).withMessage('Please provide a password with at least 6 characters.'),

    handleValidationErrors
];

//signup
router.post('/', validateSignup, async (req, res) => {
    const { email, password, username, firstName, lastName } = req.body;
    const hashedPassword = bcrypt.hashSync(password);
    const user = await User.create({ email, username, hashedPassword, firstName, lastName });

    const safeUser = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName
    };

    await setTokenCookie(res, safeUser);

    return res.json({
        user: safeUser
    });
  }
);



module.exports = router;
