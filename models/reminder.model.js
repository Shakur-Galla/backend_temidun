import mongoose from 'mongoose';

const ReminderSchema = new mongoose.Schema({
  monitor: { type: mongoose.Schema.Types.ObjectId, ref: 'Monitor', required: true },
  message: { type: String, required: true },
  frequency: { type: String, enum: ['Daily', 'Weekly', 'Custom'], default: 'Daily' },
  time: { type: String }, // e.g., "09:00 AM"
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Reminder', ReminderSchema);
