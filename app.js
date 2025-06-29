import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors'
import {PORT} from './config/env.js'
import authRouter from "./routes/auth.routes.js";
import reportRouter from "./routes/report.routes.js";
import reporterRouter from "./routes/reporter.routes.js";
import monitorRouter from "./routes/monitor.routes.js";
import connectToDatabase from "./database/mongodb.js";
import errorMiddleware from "./middleware/error.middleware.js";


const allowedOrigins = [
  "http://localhost:3000",
  "https://temidun.vercel.app",
  "https://temidun.vercel.app/"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // allows sending cookies
};

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(cookieParser())
app.use(cors(corsOptions));

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/reports', reportRouter)
app.use('/api/v1/reporters', reporterRouter)
app.use('/api/v1/monitors', monitorRouter)

app.use(errorMiddleware)

app.get('/', (req, res) =>{
    res.send('Welcome to Temidun Backend Service')
})

app.listen(PORT, async() =>{
    console.log(`Server Runiing on http://localhost:${PORT}`)
    await connectToDatabase()
})

export default app