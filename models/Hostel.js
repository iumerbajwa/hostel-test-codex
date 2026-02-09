const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    university: { type: String, trim: true },
    distance: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    gender: { type: String, enum: ['male', 'female', 'any'], default: 'any' },
    verified: { type: Boolean, default: false },
    image: { type: String, trim: true },
    description: { type: String, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hostel', hostelSchema);
