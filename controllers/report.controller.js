import mongoose from "mongoose";
import Report from "../models/report.model.js";
import Reporter from "../models/reporter.model.js";
import Monitor from "../models/monitor.model.js";
import sendEmail from "../utility/sendEmail.js";
import { reportSubmittedTemplate } from "../utility/email-template.js";

export const createReport = async (req, res, next) => {
  const session = await mongoose.startSession();
  let transactionCommitted = false;

  try {
    session.startTransaction();
    const reporter = req.reporter;

    const {
      tasksCompleted,
      location,
      activities,
      hasIncompleteTasks,
      incompleteExplanation,
      supportRequest,
      additionalNotes,
    } = req.body;

    const media = [];

    if (req.files?.video && req.files.video[0]) {
      media.push({
        url: req.files.video[0].path,
        type: "video",
        format: req.files.video[0].format,
      });
    }

    if (req.files?.audio && req.files.audio[0]) {
      media.push({
        url: req.files.audio[0].path,
        type: "audio",
        format: req.files.audio[0].format,
      });
    }

    const report = await Report.create([{
      reporter: reporter._id,
      monitor: reporter.monitor,
      date: new Date(),
      location,
      activities,
      tasksCompleted,
      hasIncompleteTasks,
      incompleteExplanation: hasIncompleteTasks ? incompleteExplanation : undefined,
      media,
      supportRequest,
      additionalNotes,
      status: media.length > 0 ? "submitted" : "draft",
    }], { session });

    await Reporter.findByIdAndUpdate(
      reporter._id,
      { $push: { reports: report[0]._id } },
      { session }
    );

    await session.commitTransaction();
    transactionCommitted = true;
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Report created and media uploaded successfully.",
      data: report[0],
    });
  } catch (error) {
    if (!transactionCommitted) await session.abortTransaction();
    session.endSession();
    next(error);
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
      path: "reports",
      match: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {},
      options: { sort: { date: -1 } }, // Newest first
      // select only the fields you want to send in the API (optional)
      select: "_id date location tasksCompleted media status hasIncompleteTasks incompleteExplanation",
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


export const getReporterReport = async (req, res, next) => {
  try {
    const reporterFromToken = req.reporter;
    const reporterIdFromParam = req.params.id;

    // Secure access check
    if (
      !reporterFromToken ||
      reporterFromToken._id.toString() !== reporterIdFromParam
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to reports",
      });
    }

    // Optional: Check reporter existence
    const existingReporter = await Reporter.findById(reporterIdFromParam);
    if (!existingReporter) {
      return res.status(404).json({
        success: false,
        message: "Reporter not found",
      });
    }

    // Fetch reports (you may clarify if this should fetch *one* report by report ID)
    const reports = await Report.find({ reporter: reporterIdFromParam })
      .sort({ date: -1 })
      .populate("monitor", "fullName email")
      .lean();

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
}