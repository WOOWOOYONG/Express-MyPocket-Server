import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  userName: {
    type: String,
    required: true,
  },
  googleID: {
    type: String,
    unique: true,
  },
  thumbnail: {
    type: String,
  },
  password: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', UserSchema);

export default User;
