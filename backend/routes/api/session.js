const express = require('express')
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');
const router = express.Router();

//login attempt
router.post('/', async (req, res, next) => {
    //the user can provide either username or email in the credential key in the req body
      const { credential, password } = req.body;
      //unscoped so we can get the hashed pw
      const user = await User.unscoped().findOne({
        where: {
          [Op.or]: {
            username: credential,
            email: credential
          }
        }
      });
      //if user not found or the input pw does not generate an equiv hashed pw
      //toString() b/c the hashedPW is a binary string?
      if (!user || !bcrypt.compareSync(password, user.hashedPassword.toString())) {
        const err = new Error('Login failed');
        err.status = 401;
        err.title = 'Login failed';
        err.errors = { credential: 'The provided credentials were invalid.' };
        return next(err);
      }


      const safeUser = {
        id: user.id,
        email: user.email,
        username: user.username,
      };

      await setTokenCookie(res, safeUser);

      return res.json({
        user: safeUser
      });
    }
  );

//Log out
//Remember, you need to pass in the value of the XSRF-TOKEN cookie as a header in the fetch request because the logout route has a DELETE HTTP verb.
router.delete('/', (_req, res) => {
    res.clearCookie('token');
    return res.json({ message: 'success' });
    }
);

// Restore session user
router.get('/', (req, res) => {
    const { user } = req;
    if (user) {
      const safeUser = {
        id: user.id,
        email: user.email,
        username: user.username,
      };
      return res.json({
        user: safeUser
      });
    } else return res.json({ user: null });
  }
);


module.exports = router;
