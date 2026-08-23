import express from "express"
import dotenv from 'dotenv';
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";
import { startAnomalyDetector } from './anomalyAgent.js';
import { startEmailAgent } from './emailAgent.js';
import { startAllStateAgents } from './StateAgent.js';



const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};
startEmailAgent();
startServer();
startAnomalyDetector();
startAllStateAgents();
