import Report from "../models/report.model.js"
import Reporter from "../models/reporter.model.js"
import Monitor from "../models/monitor.model.js"
import sendEmail from "../utility/sendEmail.js";
import { reportSubmittedTemplate } from "../utility/email-template.js";


export const createReport = async (req, res, next) => {
  try {
    const reporter = req.reporter;

    if (!reporter) {
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
      documents, // Array of { fileName, fileUrl, fileType, fileSize }
      customFormResponses, // Optional
    } = req.body;

    const report = await Report.create({
      reporter: reporter._id,
      monitor: reporter.monitor,
      activities,
      taskSummary,
      videoUrl,
      audioUrl,
      supportRequest,
      documents,
      customFormResponses,
      date: new Date(), // Auto filled but overrideable for testing
    });

    // Link report to reporter
    await Reporter.findByIdAndUpdate(
      reporter._id,
      { $push: { reports: report[0]._id } },
      { session }
    );

    // Send email to monitor
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
        text: `A new report has been submitted by ${reporter.fullName} on ${new Date().toLocaleString()}. Please log in to your dashboard to review it.`,
      });
    }

    res.status(201).json({
      success: true,
      message: "Report created successfully",
      data: report,
    });
  } catch (error) {
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