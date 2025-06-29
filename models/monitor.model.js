import mongoose from "mongoose";

const inviteLimits = {
  Basic: 1,
  Standard: 3,
  Premium: 10,
};

const MonitorSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please fill a valid email address",
      ],
    },
    password: { type: String, required: true },
    country: { type: String },
    relationship: {
      type: String,
      enum: ["Parent", "Employer", "Spouse", "Teacher", "Other"],
    },
    accessCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    accessCodeExpires: {
      type: Date,
    },
    subscriptionPlan: {
      type: String,
      enum: ["Basic", "Standard", "Premium"],
      default: "Basic",
    },
    invites: [
      {
        email: { 
          type: String, 
          required: true 
        },
        invitedAt: { 
          type: Date, 
          default: Date.now 
        },
        
        accessCode: {
          type: String,
          required: true
        }
      },
    ],
    inviteCount: {
      type: Number,
      default: 0,
    },
    reporters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reporter" }],
    reminders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reminder" }],
    customForms: [{ type: mongoose.Schema.Types.ObjectId, ref: "CustomForm" }],
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    createdAt: { type: Date, default: Date.now },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

MonitorSchema.methods.canInvite = function() {
  const plan = this.subscriptionPlan || 'Basic';
  const maxInvites = inviteLimits[plan] || inviteLimits.Basic;
  return (this.inviteCount || 0) < maxInvites;
};

// method to generate unique access code
MonitorSchema.methods.generateAccessCode = async function() {
  let isUnique = false;
  let newCode;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    attempts++;
    newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const existing = await mongoose.models.Monitor.findOne({
      accessCode: newCode,
    });
    if (!existing) {
      isUnique = true;
    }
  }

  if (!isUnique) {
    throw new Error('Failed to generate unique access code');
  }

  return newCode;
};

export default mongoose.model("Monitor", MonitorSchema);