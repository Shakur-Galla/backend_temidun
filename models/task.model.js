import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  monitor: { type: mongoose.Schema.Types.ObjectId, ref: 'Monitor', required: true },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'Reporter', required: true },
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
}, {
    timestamps:true
});

export default mongoose.model('Task', TaskSchema);
