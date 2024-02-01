import express from 'express';
import passport from 'passport';
import generateJWT from '../utils/generateJWT.mjs';
import verifyToken from '../middlewares/auth.mjs';

const router = express.Router();

router.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['email', 'profile'],
    prompt: 'select_account',
  })
);

router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false,
  }),
  (req, res) => {
    const token = generateJWT(req.user);
    res.cookie('access-token', token, { httpOnly: true, secure: true });
    res.redirect('http://localhost:3000/login/redirect');
  }
);

router.get('/api/login', verifyToken, (req, res) => {
  const user = req.user;
  res.status(200).send({ msg: `Hello ${user.userName}` });
});

router.post('/api/register', (req, res) => {
  console.log(req.body);
});

router.post('/api/userInfo', verifyToken, (req, res) => {
  const user = req.user;
  console.log('get userInfo');
  if (!user) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const userInfo = {
    userName: user.userName,
    userId: user._id,
    email: user.email,
    thumbnail: user.thumbnail,
  };

  res.status(200).send(userInfo);
});

export default router;
