import jwt from 'jsonwebtoken'
import { JWT_SECRET } from "../config/env.js"
import Monitor from '../models/monitor.model.js'
import Reporter from '../models/reporter.model.js'

export const authorizeMonitor = async (req, res, next) => {
  try {
    let token;

    // 1. Check Bearer token
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2. Check httpOnly cookie
    if (!token && req.cookies?.temidun_token) {
      token = req.cookies.temidun_token;
    }

    // 3. If still no token, reject
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // 4. Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    const monitor = await Monitor.findById(decoded.monitorId || decoded.userId); // in case token uses userId
    if (!monitor) {
      return res.status(401).json({ message: "Unauthorized: Invalid monitor" });
    }

    req.monitor = monitor;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Unauthorized",
      error: error.message,
    });
  }
};


export const authorizeReporter = async (req, res, next) => {
  try {
    let token;

    // 1. Check Bearer token
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2. Check httpOnly cookie
    if (!token && req.cookies?.temidun_token) {
      token = req.cookies.temidun_token;
    }

    // 3. If still no token, reject
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // 4. Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    const reporter = await Reporter.findById(decoded.reporterId || decoded.userId); // in case token uses userId
    if (!reporter) {
      return res.status(401).json({ message: "Unauthorized: Invalid Reporter" });
    }

    req.reporter = reporter;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Unauthorized",
      error: error.message,
    });
  }
};

