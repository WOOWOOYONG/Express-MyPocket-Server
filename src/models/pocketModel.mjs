import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const targetSchema = new Schema({
  target: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
});

const pocketSchema = new Schema(
  {
    status: {
      type: Boolean,
      default: false,
    },
    collect: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 50,
    },
    shopName: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 50,
    },
    region: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 50,
    },
    targets: [targetSchema],
    totalPrice: {
      type: Number,
      default: 0,
    },
    memo: {
      type: String,
      minlength: 1,
      maxlength: 300,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    level: {
      type: String,
      enum: ['S', 'A', 'B', 'C'],
    },
  },
  {
    timestamps: true,
  }
);

pocketSchema.pre('save', function (next) {
  if (this.targets && this.targets.length > 0) {
    this.totalPrice = this.targets.reduce(
      (sum, target) => sum + (target.price || 0),
      0
    );
  } else {
    this.totalPrice = 0;
  }
  next();
});

const Pocket = mongoose.model('Pocket', pocketSchema);

export default Pocket;
