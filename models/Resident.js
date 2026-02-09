const mongoose = require('mongoose');

const residentSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    contact: { type: String, trim: true },
    program: { type: String, trim: true },
    room: { type: String, trim: true },
    moveIn: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resident', residentSchema);
