import mongoose from "mongoose";
import Report from "../models/report.model.js"
import Reporter from "../models/reporter.model.js"
import Monitor from "../models/monitor.model.js"
import sendEmail from "../utility/sendEmail.js";
import { reportSubmittedTemplate } from "../utility/email-template.js";


export const createReport = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const reporter = req.reporter;

    if (!reporter) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Reporter not found in request",
      });
    }

    const {
      activities,
      taskSummary,
      videoUrl,
      audioUrl,
      supportRequest,
      documents,
      customFormResponses,
    } = req.body;

    // Create report WITHIN the transaction
    const [report] = await Report.create([{
      reporter: reporter._id,
      monitor: reporter.monitor,
      activities,
      taskSummary,
      videoUrl,
      audioUrl,
      supportRequest,
      documents,
      customFormResponses,
      date: new Date(),
    }], { session }); // Pass session here

    // Link report to reporter
    await Reporter.findByIdAndUpdate(
      reporter._id,
      { $push: { reports: report._id } },
      { session } // Maintain session consistency
    );

    // Commit transaction before external operations
    await session.commitTransaction();
    session.endSession();

    // Send email (outside transaction)
    const monitor = await Monitor.findById(reporter.monitor);
    if (monitor?.email) {
      const emailHtml = reportSubmittedTemplate({
        reporterName: reporter.fullName,
        submissionDate: new Date().toLocaleString(),
      });

      await sendEmail({
        to: monitor.email,
        subject: "New Report Submitted",
        html: emailHtml,
        text: `A new report has been submitted by ${reporter.fullName} on ${new Date().toLocaleString()}.`,
      });
    }

    res.status(201).json({
      success: true,
      message: "Report created successfully",
      data: report,
    });
  } catch (error) {
    // Proper error handling with transaction rollback
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const getReporterReports = async(req, res, next)=>{
    try{
        if(req.reporter.id !== req.params.id){
            const error = new Error('You are unauthorized')
            throw error
        }
        const reports = await Report.find({reporter: req.params.id})
        res.status(200).json({success:true, data:reports})
    }catch(error){
        next(error)
    }
}

export const getReporterReport = async(req, res, next)=>{
    try{
        if(req.reporter.id !== req.params.id){
            const error = new Error('You are unauthorized')
            throw error
        }
        const reports = await Report.find({reporter: req.params.id})
        res.status(200).json({success:true, data:reports})
    }catch(error){
        next(error)
    }
}