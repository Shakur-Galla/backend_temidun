import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Activity name is required'],
    minlength: [3, 'Activity name must be at least 3 characters']
  },
  description: {
    type: String,
    required: [true, 'Activity description is required'],
    minlength: [10, 'Description must be at least 10 characters']
  }
});

const MediaSchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, 'Media URL is required'],
    validate: {
      validator: v => /https?:\/\/.+/.test(v),
      message: 'Invalid URL format'
    }
  },
  type: {
    type: String,
    required: true,
    enum: ['video', 'audio']
  },
  format: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  duration: Number,
  thumbnail: String
});

const ReportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reporter',
    required: [true, 'Reporter is required']
  },
  monitor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Monitor',
    required: [true, 'Accountability partner is required']
  },
  date: {
    type: Date,
    default: Date.now,
    validate: {
      validator: v => v <= new Date(),
      message: 'Report date cannot be in the future'
    }
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    minlength: [5, 'Location must be at least 5 characters']
  },
  activities: [ActivitySchema],
  tasksCompleted: {
    type: String,
    required: [true, 'Tasks completed field is required'],
    minlength: [10, 'Tasks completed must be at least 10 characters']
  },
  hasIncompleteTasks: {
    type: Boolean,
    required: [true, 'Incomplete tasks status is required']
  },
  incompleteExplanation: {
    type: String,
    required: function() {
      return this.hasIncompleteTasks;
    },
    minlength: [10, 'Explanation must be at least 10 characters']
  },
  media: [MediaSchema],
  supportRequest: {
    type: String,
    maxlength: [500, 'Support request cannot exceed 500 characters']
  },
  additionalNotes: {
    type: String,
    maxlength: [500, 'Additional notes cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['draft', 'submitted'],
    default: 'draft'
  },
  notificationSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for faster queries
ReportSchema.index({ reporter: 1, date: 1 });
ReportSchema.index({ status: 1, createdAt: 1 });

// Virtual for formatted date
ReportSchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

// Auto-update status when media is added
ReportSchema.pre('save', function(next) {
  if (this.media.length > 0 && this.status === 'draft') {
    this.status = 'submitted';
  }
  next();
});



export default mongoose.model('Report', ReportSchema);