import mongoose from 'mongoose';

const rollSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  values: { type: [Number], required: true },
  total: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Roll = mongoose.model('Roll', rollSchema);
