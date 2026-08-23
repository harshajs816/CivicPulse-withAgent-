import express from 'express';
import { generateReport } from '../agent.js'; 
import { getActiveAlert } from '../anomalyAgent.js';

const router = express.Router();

// GET API: http://localhost:5000/api/ai-insights
router.get('/ai-insights', async (req, res) => {
    try {
        // AI function ko on-demand call karein
        const aiReport = await generateReport();
        
        res.status(200).json({
            success: true,
            data: aiReport
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "AI Error" });
    }
});

router.get('/anomaly-alert', (req, res) => {
    const alert = getActiveAlert();
    if (alert) {
        res.status(200).json({ success: true, alert: alert });
    } else {
        res.status(200).json({ success: true, alert: null });
    }
});

export default router;