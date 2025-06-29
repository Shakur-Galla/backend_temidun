import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
  fileName: { 
    type: String, 
    required: [true, "File name is required"] 
  },
  fileUrl: { 
    type: String, 
    required: [true, "File URL is required"],
    validate: {
      validator: v => /https?:\/\/.+/.test(v),
      message: "Invalid file URL format"
    }
  },
  fileType: { 
    type: String,
    enum: {
      values: [
        'image/jpeg', 'image/png', 'image/gif', 
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      message: "Invalid document type"
    }
  },
  fileSize: { 
    type: Number,
    min: [1024, "File too small (min 1KB)"],
    max: [50 * 1024 * 1024, "File too large (max 50MB)"]
  }
});

const ReportSchema = new mongoose.Schema({
  reporter: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Reporter', 
    required: [true, "Reporter is required"] 
  },
  monitor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Monitor', 
    required: [true, "Monitor is required"] 
  },
  date: { 
    type: Date, 
    default: Date.now,
    validate: {
      validator: v => v <= Date.now(),
      message: "Date cannot be in the future"
    }
  },
  activities: [{ 
    type: String,
    minlength: [3, "Each activity description must have at least 3 characters"]
  }],
  taskSummary: { 
    type: String,
    minlength: [10, "Task summary too short (min 10 characters)"]
  },
  videoUrl: { 
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /https?:\/\/.+/.test(v) && 
               ['.mp4', '.mov'].some(ext => v.toLowerCase().endsWith(ext));
      },
      message: "Invalid video URL or format (must be MP4 or MOV)"
    }
  },
  audioUrl: { 
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /https?:\/\/.+/.test(v) && 
               ['.mp3', '.m4a'].some(ext => v.toLowerCase().endsWith(ext));
      },
      message: "Invalid audio URL or format (must be MP3 or M4A)"
    }
  },
  supportRequest: { 
    type: String,
    maxlength: [500, "Support request too long (max 500 characters)"]
  },
  documents: [FileSchema], 
  customFormResponses: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'CustomForm' 
  }]
}, {
  timestamps: true
});

export default mongoose.model('Report', ReportSchema);
