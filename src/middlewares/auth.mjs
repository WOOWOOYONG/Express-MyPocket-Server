import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  const token = req.cookies['token'];
  if (!token) {
    return res.status(401).send({ msg: '沒有操作權限' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).send({ msg: '無效的 token' });
  }
};

export default verifyToken;
