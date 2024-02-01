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
    res.redirect('/');
  }
);

router.get('/api/login', verifyToken, (req, res) => {
  const user = req.user;
  res.status(200).send({ msg: `Hello ${user.userName}` });
});

router.post('/api/register', (req, res) => {
  console.log(req.body);
});

export default router;
