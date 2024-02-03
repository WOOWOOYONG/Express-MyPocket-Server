import express from 'express';
import passport from 'passport';
import generateJWT from '../utils/generateJWT.mjs';
import verifyToken from '../middlewares/auth.mjs';
import jwt from 'jsonwebtoken';
import { registerValidation, loginValidation } from '../validation.mjs';
import User from '../models/userModel.mjs';

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
    const frontendRedirectUrl = `http://localhost:3000/login/redirect?token=${token}`;
    res.redirect(frontendRedirectUrl);
    // res.cookie('token', token, { httpOnly: true, secure: false });
  }
);

// 使用者註冊
router.post('/api/register', async (req, res) => {
  const { error } = registerValidation(req.body);
  console.log(error);
  if (error) return res.status(400).send(error.details[0].message);

  const emailExist = await User.findOne({
    email: req.body.email,
  });
  if (emailExist) return res.status(400).send('此信箱已被註冊');

  const { email, userName, password } = req.body;
  const defaultThumbnail =
    'https://i.pinimg.com/564x/a3/2a/fc/a32afc3ac036e90b6cf06e59ad04ed22.jpg';
  const newUser = new User({
    email,
    userName,
    password,
    thumbnail: defaultThumbnail,
  });
  try {
    const savedUser = await newUser.save();
    return res.send({
      msg: '使用者成功註冊',
      savedUser,
    });
  } catch (error) {
    return res.status(500).send('無法註冊');
  }
});

// 使用者登入
router.post('/api/login', async (req, res) => {
  console.log('使用者登入');
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const foundUser = await User.findOne({ email: req.body.email });
  if (!foundUser) {
    return res.status(401).send('無法找到使用者，請確認電子信箱是否正確');
  }
  foundUser.comparePassword(req.body.password, (error, isMatch) => {
    if (error) {
      return res.status(500).send(error);
    }
    if (isMatch) {
      const token = generateJWT(foundUser);
      const { email, userName, thumbnail, _id } = foundUser;
      const userData = {
        email,
        userName,
        thumbnail,
        id: _id,
      };

      res.status(200).send({ token, data: userData, ok: true });
    } else {
      return res.status(401).send({ msg: '密碼錯誤', ok: false });
    }
  });
});

// 取得使用者資料
router.post('/api/userInfo', verifyToken, (req, res) => {
  const user = req.user;
  console.log('取得使用者資料');
  if (!user) {
    return res.status(401).send({ error: '沒有操作權限', ok: false });
  }
  const userInfo = {
    userName: user.userName,
    userId: user._id,
    email: user.email,
    thumbnail: user.thumbnail,
  };

  res.status(200).send({ data: userInfo, ok: true });
});

// 使用者登出
// router.post('/api/logout', (req, res) => {
//   console.log('使用者登出');
//   // res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
//   res.status(200).send({ message: '成功登出' });
// });

export default router;
