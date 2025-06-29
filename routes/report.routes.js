import { Router } from "express";
import { createReport, getReporterReports } from "../controllers/report.controller.js";
import { authorizeReporter } from "../middleware/auth.middleware.js";

const reportRouter = Router();

// Create Report
reportRouter.post('/',authorizeReporter ,createReport);

// Get All Reports (global/admin usage — optional)
reportRouter.get('/', (req, res) => {
  res.send({ title: 'Get all Reports' });
});

// Get Single Report by ID
reportRouter.get('/:id', (req, res) => {
  res.send({ title: 'Get a Report' });
});

// Update a Report
reportRouter.put('/:id', (req, res) => {
  res.send({ title: 'Update a Report' });
});

// Delete a Report
reportRouter.delete('/:id', (req, res) => {
  res.send({ title: 'Delete a Report' });
});

// Get all Reports of a Reporter
reportRouter.get('/reporter/:id', authorizeReporter, getReporterReports);

// Get all Reports of a Reporter under a specific Monitor
reportRouter.get('/monitors/:monitorId/reporters/:reporterId/reports', (req, res) => {
  res.send({ title: 'Get all Reports of a Reporter under a Monitor' });
});

// Get a specific Report of a Reporter under a Monitor
reportRouter.get('/monitors/:monitorId/reporters/:reporterId/reports/:reportId', (req, res) => {
  res.send({ title: 'Get a specific Report of a Reporter under a Monitor' });
});

export default reportRouter;
