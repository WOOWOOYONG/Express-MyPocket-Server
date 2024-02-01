import express from 'express';
import passport from 'passport';
import mongoose from 'mongoose';
import cors from 'cors';
// import session from 'express-session';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import './strategies/google-strategy.mjs';
import userRoutes from './routes/user.mjs';

const app = express();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log(`Error ${err}`);
  });

const corsOptions = {
  origin: 'http://localhost:3000', // 您的前端應用的地址
  credentials: true, // 允許發送 cookie
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie: { secure: false },
//   })
// );
app.use(passport.initialize());
// app.use(passport.session());

const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.status(200).send({ msg: 'Hello World' });
});

app.use('/', userRoutes);

app.listen(PORT, () => {
  console.log(`Server is Running on Port ${PORT}`);
});
