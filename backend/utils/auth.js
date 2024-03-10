const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');
const { User } = require('../db/models');

const { secret, expiresIn } = jwtConfig;

// Sends a JWT Cookie
//will be used in the login and signup routes
const setTokenCookie = (res, user) => {
    // Create the token.
    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
    };
    const token = jwt.sign(
      { data: safeUser },
      secret,//secret and expiresIn imported from config/index.js (ultimately from .env)
      { expiresIn: parseInt(expiresIn) } // 604,800 seconds = 1 week
    );

    const isProduction = process.env.NODE_ENV === "production";

    // Set the token cookie
    res.cookie('token', token, {
      maxAge: expiresIn * 1000, // maxAge in milliseconds
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction && "Lax"
    });

    return token;
  };

//The restoreUser middleware will be connected to the API router so that all API route handlers will check if there is a current user logged in or not.
const restoreUser = (req, res, next) => {
    // token parsed from cookies
    const { token } = req.cookies;
    //new k/v pair on the req object that can be accessed by next middleware/routehandlers
    req.user = null;

    return jwt.verify(token, secret, null, async (err, jwtPayload) => {
        if (err) {
            return next();
        }

        try {
            const { id } = jwtPayload.data;
            req.user = await User.findByPk(id, {//capturing the user in the new k/v pair of the req obj
                attributes: {
                    //overriding the defaultScope which excludes crAt and upAt
                    include: ['email', 'createdAt', 'updatedAt']
                }
            });
        } catch (e) {
            res.clearCookie('token');
            return next();
        }

        if (!req.user) res.clearCookie('token');

        return next();
    });
};

//meant to be used after restoreUser runs
//first thing it does is just check the req.user property created by restoreUser
const requireAuth = function (req, _res, next) {
    if (req.user) return next();

    const err = new Error('Authentication required');
    err.title = 'Authentication required';
    err.errors = { message: 'Authentication required' };
    err.status = 401;

    //tag w/ authentication key to reformat this error in the
    //error formatter in App.js
    err.authentication = true;

    return next(err);
}

module.exports = { setTokenCookie, restoreUser, requireAuth };
