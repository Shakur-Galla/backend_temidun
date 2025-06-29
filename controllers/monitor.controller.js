import Monitor from "../models/monitor.model.js";
import Reporter from '../models/reporter.model.js'
import Report from '../models/report.model.js'
import sendEmail from "../utility/sendEmail.js";
import { generateEmailTemplate } from "../utility/email-template.js";
import validator from "validator";
import { inviteLimits } from "../config/inviteLimits.js";

export const getMonitors = async (req, res, next) => {
  try {
    const monitors = await Monitor.find();

    res.status(200).json({ success: true, data: monitors });
  } catch (error) {
    next(error);
  }
};

export const getMonitor = async (req, res, next) => {
  try {
    const monitor = await Monitor.findById(req.params.id).select("-password");

    if (!monitor) {
      const error = new Error("Monitor not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, data: monitor });
  } catch (error) {
    next(error);
  }
};

export const inviteReporter = async (req, res, next) => {
  try {
    const monitor = req.monitor
    if (!monitor) {
      const error = new Error("Monitor not found");
      error.statusCode = 404;
      throw error;
    }
    const { reporterEmail } = req.body;

    if (!reporterEmail || !validator.isEmail(reporterEmail)) {
      return res.status(400).json({
        success: false,
        message: "Valid reporter email is required",
      });
    }

    const plan = monitor.subscriptionPlan || "Basic";
    const maxInvites = inviteLimits[plan] || inviteLimits.Basic;
    const currentCount = monitor.inviteCount || 0;

    if (currentCount >= maxInvites) {
      return res.status(403).json({
        success: false,
        message: `Invite limit reached for your ${plan} plan.`,
        currentCount,
        maxInvites,
        upgradeRequired: true,
      });
    }

    const newAccessCode = await monitor.generateAccessCode();

    monitor.accessCode = newAccessCode;
    monitor.accessCodeExpires = new Date(Date.now() + 60 * 60 * 1000);
    monitor.inviteCount = currentCount + 1;

    monitor.invites.push({
      email: reporterEmail,
      accessCode: newAccessCode,
    });

    const savedMonitor = await monitor.save();

    // custom email template
    const subject = "Join Temidun Accountability Platform";
    const signupUrl = `https://temidun.vercel.app/reporter-signup?code=${newAccessCode}`;

    const html = generateEmailTemplate({
      fullName: monitor.fullName,
      accessCode: newAccessCode,
      signUpUrl: signupUrl,
    });

    try {
      await sendEmail({
        to: reporterEmail,
        subject,
        html,
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);

      // Rollback invitation state
      savedMonitor.inviteCount = currentCount;
      savedMonitor.invites.pop();
      await savedMonitor.save();

      return res.status(500).json({
        success: false,
        message: "Invitation created but email failed to send",
        accessCode: newAccessCode,
      });
    }

    res.status(200).json({
      success: true,
      message: `Invitation sent to ${reporterEmail}`,
      currentCount: savedMonitor.inviteCount,
      maxInvites,
    });
  } catch (error) {
    console.error("Invite error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getReporterReports = async (req, res, next) => {
  try {
    const { monitor } = req;
    const { reporterId } = req.params;
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const reporter = await Reporter.findById(reporterId).populate({
      path: 'reports',
      match: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {},
      options: { sort: { date: -1 } } // Newest first
    });

    if (!reporter || reporter.monitor.toString() !== monitor.id) {
      const error = new Error("You are not authorized to view this reporter's reports");
      error.statusCode = 403;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: {
        reporter: {
          _id: reporter._id,
          fullName: reporter.fullName,
          email: reporter.email,
        },
        reports: reporter.reports,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMonitorReporters = async (req, res, next) => {
  try {
    if (String(req.monitor._id) !== String(req.params.id)) {
      const error = new Error('You do not have access to this account');
      error.statusCode = 401;
      throw error;
    }

    const reporters = await Reporter.find({ monitor: req.params.id }).populate({
        path: 'reports',
        select: '_id email taskSummary' 
      })
      .exec();

    res.status(200).json({ success: true, data: reporters });
  } catch (error) {
    next(error);
  }
};

//Get a reporter's report under a monitor
export const getReporterReport = async (req, res, next) => {
  try {
    const { monitor } = req;
    const { reportId } = req.params;

    const report = await Report.findById(reportId).populate({
      path: 'reporter',
      select: 'fullName email',
    });

    if (!report) {
      const error = new Error('Report not found');
      error.statusCode = 404;
      throw error;
    }

    if (report.monitor.toString() !== monitor.id) {
      const error = new Error('You are not authorized to view this report');
      error.statusCode = 403;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

export const getReporterDetails = async (req, res, next) => {  
  try {
    const { monitor } = req; // monitor injected by authorize middleware
    const { reporterId } = req.params;

    // Fetch reporter and include associated reports
    const reporter = await Reporter.findById(reporterId)
      .populate({
        path: 'reports',
        options: { sort: { date: -1 } }, // optional: sort reports by date
      });

    if (!reporter) {
      const error = new Error('Reporter not found');
      error.statusCode = 404;
      throw error;
    }

    // 
    if (reporter.monitor.toString() !== monitor.id) {
      const error = new Error('You are not authorized to view this reporter');
      error.statusCode = 403;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: reporter,
    });
  } catch (error) {
    next(error);
  }
};