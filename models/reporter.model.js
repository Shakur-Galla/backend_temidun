import mongoose from "mongoose";

const ReporterSchema = new mongoose.Schema(
  {
    fullName: { type: String },
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
    country: { type: String },
    address: { type: String },
    monitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Monitor",
      required: true,
    },
    reports: [{ type: mongoose.Schema.Types.ObjectId, ref: "Report" }],
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    createdAt: { type: Date, default: Date.now },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Reporter", ReporterSchema);
