import jwt from 'jsonwebtoken';

const generateJWT = (user) => {
  return jwt.sign(
    {
      id: user._id,
      userName: user.userName,
      email: user.email,
      thumbnail: user.thumbnail,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

export default generateJWT;
