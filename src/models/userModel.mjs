import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      minlength: 6,
      maxlength: 50,
    },
    password: {
      type: String,
    },
    googleID: {
      type: String,
    },
    thumbnail: {
      type: String,
      default:
        'https://i.pinimg.com/564x/a3/2a/fc/a32afc3ac036e90b6cf06e59ad04ed22.jpg',
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.comparePassword = async function (password, cb) {
  let result;
  try {
    result = await bcrypt.compare(password, this.password);
    return cb(null, result);
  } catch (err) {
    return cb(err, result);
  }
};

// 如果使用者新註冊或是更改新密碼，將密碼進行雜湊處理
userSchema.pre('save', async function (next) {
  // Google登入，沒有密碼
  if (!this.password) return next();

  // 一般使用者登入
  if (this.isNew || this.isModified('password')) {
    const hashValue = await bcrypt.hash(this.password, 10);
    this.password = hashValue;
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
