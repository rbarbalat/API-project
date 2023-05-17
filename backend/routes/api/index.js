const router = require('express').Router();

const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const groupsRouter = require("./groups.js");
const venuesRouter = require("./venues.js");
const eventsRouter = require("./events.js");

//for testing those 2 functions
//const { setTokenCookie, requireAuth } = require('../../utils/auth.js');
const { restoreUser } = require('../../utils/auth.js');
const { User } = require('../../db/models');

//must run before anything else!!
router.use(restoreUser);

router.use("/session", sessionRouter);
router.use("/users", usersRouter);
router.use("/groups", groupsRouter);
router.use("/venues", venuesRouter);
router.use("/events", eventsRouter);

//for testing only
// router.get('/set-token-cookie', async (_req, res) => {
//   const user = await User.findOne({
//     where: {
//       username: 'gambit'
//     }
//   });
//   setTokenCookie(res, user);
//   return res.json({ user: user });
// });

//for testing only
// router.get('/restore-user', (req, res) => {
//     return res.json(req.user);
//   }
// );

//for testing only
// router.get('/require-auth', requireAuth, (req, res) => {
//     return res.json(req.user);
//   }
// );

router.post('/test', function(req, res) {
    res.json({ requestBody: req.body });
  });

module.exports = router;
