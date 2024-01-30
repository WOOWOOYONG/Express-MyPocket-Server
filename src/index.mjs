import express from 'express';
import passport from 'passport';
import mongoose from 'mongoose';
import session from 'express-session';
import 'dotenv/config';
import './strategies/google-strategy.mjs';

const app = express();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log(`Error ${err}`);
  });

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);
app.use(passport.initialize());
app.use(passport.session());

const PORT = process.env.PORT || 8080;

app.get('/', (request, response) => {
  response.status(200).send({ msg: 'Hello World' });
});

app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
);

app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
  }),
  (req, res) => {
    res.redirect('/');
  }
);

app.get('/login', (request, response) => {
  response.send({ msg: 'login Page' });
});

app.get('/api/users', (request, response) => {
  response.send([{ id: 1, username: 'tony', displayName: 'Tony' }]);
});

app.get('/api/users/:id', (request, response) => {
  console.log(request.params);
  const parsedId = parseInt(request.params.id);
  if (isNaN(parsedId)) {
    return response.status(400).send({ msg: 'Bad Request. Invalid ID' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is Running on Port ${PORT}`);
});
