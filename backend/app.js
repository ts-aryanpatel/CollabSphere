import express from "express";
import errorHandler from './middleware/errorHandler.js';
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.status(200).json({
        status: 'active',
        message: "CollabSphere Backend Core  is working fine",
        timestamp: new Date()
    });
});


app.use(errorHandler);


export default app;