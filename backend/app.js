import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js"
import aiRoutes from "./routes/aiRoutes.js"
import agentRoutes from './routes/agentRoutes.js'; 





const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);


app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MERN API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/reports", userRoutes);
app.use('/api', aiRoutes);
app.use('/api/agent', agentRoutes);

export default app;