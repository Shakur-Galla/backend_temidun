import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Reporter from "../models/reporter.model.js";
import Monitor from "../models/monitor.model.js";
import Report from "../models/report.model.js";
import bcrypt from "bcryptjs";
import { JWT_EXPIRES_IN, JWT_SECRET,NODE_ENV } from "../config/env.js";

export const createReporter = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { fullName, email, password, accessCode } = req.body;

    // Validate required fields
    if (!fullName || !email || !password || !accessCode) {
      return res.status(400).json({
        success: false,
        message: "email, password, and access code are required",
      });
    }

    // Check for existing reporter (within transaction)
    const existingReporter = await Reporter.findOne({ email }).session(session);
    if (existingReporter) {
      return res.status(409).json({
        success: false,
        message: "Reporter already exists",
      });
    }

    // Find monitor and validate access code
    const monitor = await Monitor.findOne({ accessCode }).session(session);

    if (
      !monitor ||
      !monitor.accessCodeExpires ||
      monitor.accessCodeExpires < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired access code",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create reporter (within transaction)
    const reporter = await Reporter.create(
      [
        {
          email,
          password: hashedPassword,
          monitor: monitor._id,
        },
      ],
      { session }
    );

    // Update monitor (within same transaction)
    await Monitor.findByIdAndUpdate(
      monitor._id,
      { $push: { reporters: reporter[0]._id } },
      { session }
    );

    // Generate token
    const token = jwt.sign({ reporterId: reporter[0]._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Set JWT in HTTP-only cookie
    res.cookie("temidun_token", token, {
      httpOnly: true, // Prevent JavaScript access
      secure: process.env.NODE_ENV === "production", // Use HTTPS in production
      sameSite: NODE_ENV === "production" ? "none" : "lax", // Mitigate CSRF
      maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Return response without password
    const reporterData = reporter[0].toObject();
    delete reporterData.password;

    res.status(201).json({
      success: true,
      message: "Reporter created successfully",
      data: {
        token,
        reporter: reporterData,
      },
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

//Get Reporter Reports
export const getReporterReports = async (req, res, next) => {
  try {
    // Get authenticated reporter from middleware
    const reporter = req.reporter;
    
    // Find all reports belonging to this reporter
    const reports = await Report.find({ reporter: reporter._id })
      .populate('reporter', 'email fullName') // Optional: populate reporter details
      .select('-__v'); // Exclude version key

    res.status(200).json({ 
      success: true,
      data: reports 
    });
  } catch (error) {
    next(error);
  }
};