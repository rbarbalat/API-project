const router = require('express').Router();

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth.js');
const { User } = require('../../db/models');

//must run before anything else!!
router.use(restoreUser);

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
