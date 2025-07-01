import { Router } from "express";
import { createReporter, getReporterReportById, getReporterReports } from "../controllers/reporter.controller.js";
import { authorizeReporter } from "../middleware/auth.middleware.js";

const reporterRoute = Router()

//create reporter
reporterRoute.post('/', createReporter)


// Get all Reports of a Reporter
reporterRoute.get('/:id', authorizeReporter, getReporterReports);

reporterRoute.get('/reports/:id', authorizeReporter ,getReporterReportById)

reporterRoute.put('/:id', (req, res)=>{
    res.send({title:'Update a reporter'})
})

reporterRoute.delete('/:id', (req, res) =>{
    res.send({title:'Delete a Reporter'})
})

reporterRoute.get('/monitor/:id', (req, res) =>{
    res.send({title: 'Get all Reporters of a Monitor'})
})

export default reporterRoute