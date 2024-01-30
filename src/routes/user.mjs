import express from 'express';
import passport from 'passport';

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
  }),
  (req, res) => {
    res.redirect('/');
  }
);

router.get('/login', (request, response) => {
  response.send({ msg: 'login Page' });
});

router.get('/api/users', (request, response) => {
  response.send([{ id: 1, username: 'tony', displayName: 'Tony' }]);
});

router.get('/api/users/:id', (request, response) => {
  console.log(request.params);
  const parsedId = parseInt(request.params.id);
  if (isNaN(parsedId)) {
    return response.status(400).send({ msg: 'Bad Request. Invalid ID' });
  }
});

router.get('/api/auth/profile', (request, response) => {
  return request.user ? response.send(request.user) : response.sendStatus(401);
});

export default router;
