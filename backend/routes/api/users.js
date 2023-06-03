const express = require('express');
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');
const router = express.Router();

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

/*
The validateSignup middleware is composed of the check and handleValidationErrors middleware. It checks to see if req.body.email exists and is an email, req.body.username is a minimum length of 4 and is not an email, and req.body.password is not empty and has a minimum length of 6. If at least one of the req.body values fail the check, an error will be returned as the response.
*/

const validateSignup =
[
    // check('email').exists({ checkFalsy: true }).isEmail()
    // .withMessage('Please provide a valid email.'),

    check('email').isEmail()
    .withMessage('Please provide a valid email.'),

    check('username').isLength({ min: 4 })
    .withMessage('Please provide a username with at least 4 characters.'),

    check('username').isLength({ max: 30 })
    .withMessage('Please provide a username with at most 30 characters.'),

    check('username').not().isEmail()
    .withMessage('Please provide a username that is not an email.'),

    check('firstName').isLength({ min: 1 })
    .withMessage('Please provide a first name with at least 1 character.'),

    check("firstName").isLength({ max: 30 })
    .withMessage('Please provide a first name with at most characters.'),

    check('lastName').isLength({ min: 1 })
    .withMessage('Please provide a last name with at least 1 character.'),

    check("lastName").isLength({ max: 30 })
    .withMessage('Please provide a last name with at most 30 characters.'),

    check('password').exists({ checkFalsy: true })
    .isLength({ min: 6 }).withMessage('Please provide a password with at least 6 characters.'),

    handleValidationErrors
];

//signup
router.post('/', validateSignup, async (req, res) => {
//router.post('/', async (req, res) => {
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
