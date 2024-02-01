import passport from 'passport';
import { Strategy } from 'passport-google-oauth20';
import User from '../models/userModel.mjs';

// passport.serializeUser((user, done) => {
//   console.log('Serialize 使用者');
//   done(null, user._id);
// });

// passport.deserializeUser(async (_id, done) => {
//   console.log('Deserialize 使用者');
//   const foundUser = await User.findOne({ _id });
//   done(null, foundUser);
// });

export default passport.use(
  new Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      const foundUser = await User.findOne({ googleID: profile.id }).exec();
      if (foundUser) {
        console.log('使用者已註冊');
        done(null, foundUser);
      } else {
        console.log('新用戶註冊');
        const newUser = new User({
          userName: profile.displayName,
          googleID: profile.id,
          thumbnail: profile.photos[0].value,
          email: profile.emails[0].value,
        });
        const savedUser = await newUser.save();
        console.log('成功儲存新用戶');
        done(null, savedUser);
      }
    }
  )
);
