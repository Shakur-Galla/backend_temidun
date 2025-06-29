import { Router } from "express";
import { getMonitor, getMonitors, inviteReporter, getReporterReports, getReporterReport, getReporterDetails, getMonitorReporters } from "../controllers/monitor.controller.js";
import { authorizeMonitor } from "../middleware/auth.middleware.js";

const monitorRouter = Router()

//Get All monitors
monitorRouter.get('/', getMonitors)

//Get A monitor
monitorRouter.get('/:id', authorizeMonitor ,getMonitor)

//Update a Reporter
monitorRouter.put('/:id', (req, res)=>{
    res.send({title: 'Update a Reporter'})
})

//Delete Reporter
monitorRouter.delete('/:id', (req, res)=>{
    res.send({title: 'Delete a Reporter'})
})

monitorRouter.post('/:id/invite-reporter', authorizeMonitor, inviteReporter)

//Get Reports of a single Reporter under a Monitor
monitorRouter.get('/:id/:reporterId/reports', authorizeMonitor, getReporterReports)

//Get a single report of a Reporter under a monitor
monitorRouter.get('/reports/:reportId', authorizeMonitor, getReporterReport);

//View reporter details
monitorRouter.get('/reporters/:reporterId', authorizeMonitor, getReporterDetails);

// Get reporters of a monitor
monitorRouter.get("/:id/reporters", authorizeMonitor, getMonitorReporters);


export default monitorRouter