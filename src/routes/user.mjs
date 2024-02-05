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
router.post('/api/signup', async (req, res) => {
  const { err } = registerValidation(req.body);
  console.log(err);
  if (err) return res.status(400).json(err.details[0].message);

  const emailExist = await User.findOne({
    email: req.body.email,
  });
  if (emailExist)
    return res.status(400).json({ msg: '此信箱已被註冊', ok: false });

  const { email, password, userName } = req.body;
  const newUser = new User({
    email,
    password,
    userName,
  });

  try {
    const savedUser = await newUser.save();
    return res.status(201).json({
      msg: '成功註冊',
      ok: true,
      savedUser,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: '無法註冊', ok: false });
  }
});

// 使用者登入
router.post('/api/login', async (req, res) => {
  console.log('使用者登入');
  const { err } = loginValidation(req.body);
  if (err) return res.status(400).json(err.details[0].message);

  const foundUser = await User.findOne({ email: req.body.email });
  if (!foundUser) {
    return res
      .status(401)
      .json({ msg: '無法找到使用者，請確認電子信箱是否正確', ok: false });
  }
  foundUser.comparePassword(req.body.password, (err, isMatch) => {
    if (err) {
      return res.status(500).json(err);
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

      res
        .status(200)
        .json({ msg: '成功登入', token, data: userData, ok: true });
    } else {
      return res.status(401).json({ msg: '密碼錯誤', ok: false });
    }
  });
});

// 取得使用者資料
router.post('/api/userInfo', verifyToken, (req, res) => {
  const user = req.user;
  console.log('取得使用者資料');
  if (!user) {
    return res.status(401).json({ err: '沒有操作權限', ok: false });
  }
  const userInfo = {
    userName: user.userName,
    id: user._id,
    email: user.email,
    thumbnail: user.thumbnail,
  };

  res.status(200).json({ msg: '成功取得使用者資料', data: userInfo, ok: true });
});

// 使用者登出
// router.post('/api/logout', (req, res) => {
//   console.log('使用者登出');
//   // res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
//   res.status(200).json({ message: '成功登出' });
// });

export default router;
