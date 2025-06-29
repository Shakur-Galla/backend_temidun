import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Monitor from "../models/monitor.model.js";
import Reporter from "../models/reporter.model.js"
import { JWT_EXPIRES_IN, JWT_SECRET, NODE_ENV } from "../config/env.js";

export const signUp = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { fullName, email, password } = req.body;

    // Check if user already exists
    const existingMonitor = await Monitor.findOne({ email }).session(session);
    if (existingMonitor) {
      const error = new Error("User already exists");
      error.statusCode = 409;
      throw error;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newMonitors = await Monitor.create(
      [{ fullName, email, password: hashedPassword }],
      { session }
    );

    // Generate JWT
    const token = jwt.sign({ monitorId: newMonitors[0]._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Set JWT in HTTP-only cookie
    res.cookie("temidun_token", token, {
      httpOnly: true, // Prevent JavaScript access
      secure: process.env.NODE_ENV === "production", // Use HTTPS in production
      sameSite: "none", // Mitigate 
      maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    });

    await session.commitTransaction();
    session.endSession();

    // Send response (optional: include monitor data, but avoid sending token in body for security)
    res.status(201).json({
      success: true,
      message: "Monitor created successfully",
      data: {
        monitor: newMonitors[0],
        
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};
export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let user = await Monitor.findOne({ email });
    let role = "monitor";

    if (!user) {
      user = await Reporter.findOne({ email });
      role = "reporter";
    }

    if (!user) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    // Use consistent payload structure
    const payload = { 
      userId: user._id, 
      role 
    };
    
    const token = jwt.sign(payload, JWT_SECRET, { 
      expiresIn: JWT_EXPIRES_IN 
    });

    res.cookie("temidun_token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "none",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});



    const userResponse = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      

    };

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: userResponse,
        role,
      },
    });
  } catch (error) {
    next(error);
  }
}; 
export const signOut = async (req, res, next) => {
  try {
    // Clear the httpOnly cookie by setting it to empty and expired
    res.clearCookie("temidun_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/"
    });

    res.status(200).json({
      success: true,
      message: "Sign out successful",
    });
  } catch (error) {
    next(error);
  }
};

export const verifySession = async (req, res) => {
  try {
    // Get token from correct cookie name
    const token = req.cookies.temidun_token;
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "No session token found" 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Determine user model based on role
    let user;
    if (decoded.role === 'monitor') {
      user = await Monitor.findById(decoded.userId)
        .select('-password -__v');
    } else if (decoded.role === 'reporter') {
      user = await Reporter.findById(decoded.userId)
        .select('-password -__v');
    } else {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid user role" 
      });
    }

    if (!user) {
      // Clear cookie if user not found
      res.clearCookie('temidun_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
      });
      
      return res.status(401).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      user,
      role: decoded.role
    });
  } catch (error) {
    console.error("Session verification error:", error);
    
    // Clear cookie with same options as set
    res.clearCookie('temidun_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: "Session expired. Please login again." 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid session token" 
      });
    }
    
    // Handle other potential errors
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

