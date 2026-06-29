import express from "express";
import errorHandler from './middleware/errorHandler.js';
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());


app.use('/api/auth', authRoutes);

app.get("/health", (req, res) => {
    res.status(200).json({
        status: 'active',
        message: "CollabSphere Backend Core  is working fine",
        timestamp: new Date()
    });
});


app.use(errorHandler);


export default app;