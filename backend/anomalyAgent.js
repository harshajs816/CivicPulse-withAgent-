import cron from 'node-cron';
import { GoogleGenAI } from '@google/genai';
import Report from './models/reportSchema.js';

// =====================================================
// 1. GEMINI AI SETUP
// =====================================================

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

// =====================================================
// 2. ACTIVE ALERT STORAGE
// =====================================================

// Temporary in-memory alert
let currentActiveAlert = null;

// Alert clear timer
let alertClearTimer = null;

// =====================================================
// 3. GET ACTIVE ALERT
// =====================================================

export const getActiveAlert = () => {
    return currentActiveAlert;
};

// =====================================================
// 4. ANOMALY DETECTION
// =====================================================

export async function detectAnomalies() {

    try {

        console.log(
            '🔍 Checking for anomalies in recent data...'
        );

        // -------------------------------------------------
        // Last 12 hours
        // -------------------------------------------------

        const twelveHoursAgo = new Date(
            Date.now() - 12 * 60 * 60 * 1000
        );

        // -------------------------------------------------
        // Get recent complaints
        // -------------------------------------------------

        const recentStats = await Report.aggregate([

            {
                $match: {
                    createdAt: {
                        $gte: twelveHoursAgo
                    }
                }
            },

            {
                $group: {
                    _id: '$category',

                    recent_count: {
                        $sum: 1
                    }
                }
            }

        ]);

        // -------------------------------------------------
        // No recent complaints
        // -------------------------------------------------

        if (recentStats.length === 0) {

            console.log(
                'ℹ️ No complaints found in the last 12 hours.'
            );

            return null;
        }

        console.log(
            '📊 Recent complaint statistics:',
            recentStats
        );

        // =================================================
        // 5. AI PROMPT
        // =================================================

        const prompt = `
You are an Anomaly Detection AI for a smart city dashboard.

Here is the civic complaint data from the LAST 12 HOURS,
grouped by department/category:

${JSON.stringify(recentStats, null, 2)}

Analyze this data and determine whether there is an unusual
spike or anomaly.

Examples:
- One category has dramatically more complaints than others.
- A category suddenly has a very large number of complaints.
- A clear unusual concentration exists in one department.

Do not invent information.
Base your decision ONLY on the provided data.

If there is a RED FLAG, return exactly:

{
  "anomalyDetected": true,
  "department": "category name",
  "alertMessage": "Short warning message"
}

If everything looks normal, return exactly:

{
  "anomalyDetected": false
}

Return ONLY valid JSON.
Do not use markdown.
Do not use code fences.
Do not add explanations.
`;

        // =================================================
        // 6. GEMINI API CALL
        // =================================================

        const result = await ai.models.generateContent({

            model: 'gemini-3.6-flash',

            contents: prompt,

            config: {
                responseMimeType: 'application/json'
            }

        });

        // =================================================
        // 7. GET AI RESPONSE
        // =================================================

        const responseText = result.text;

        console.log(
            '🤖 Anomaly AI Response:',
            responseText
        );

        // =================================================
        // 8. PARSE JSON
        // =================================================

        let aiResponse;

        try {

            aiResponse = JSON.parse(responseText);

        } catch (parseError) {

            console.error(
                '🔴 Invalid JSON received from Gemini:',
                responseText
            );

            return null;
        }

        // =================================================
        // 9. RED FLAG DETECTED
        // =================================================

        if (aiResponse.anomalyDetected === true) {

            console.log(
                '🚨 RED FLAG DETECTED:',
                aiResponse.alertMessage
            );

            console.log(
                '🏢 Department:',
                aiResponse.department
            );

            // -------------------------------------------------
            // Save alert globally
            // -------------------------------------------------

            currentActiveAlert = {
                ...aiResponse,
                createdAt: new Date().toISOString()
            };

            // -------------------------------------------------
            // Clear previous timer if exists
            // -------------------------------------------------

            if (alertClearTimer) {
                clearTimeout(alertClearTimer);
            }

            // -------------------------------------------------
            // Automatically clear alert after 15 minutes
            // -------------------------------------------------

            alertClearTimer = setTimeout(() => {

                currentActiveAlert = null;
                alertClearTimer = null;

                console.log(
                    '🟢 Active anomaly alert automatically cleared.'
                );

            }, 15 * 60 * 1000);

            return currentActiveAlert;
        }

        // =================================================
        // 10. NO ANOMALY
        // =================================================

        console.log(
            '✅ No anomalies detected.'
        );

        return null;

    } catch (error) {

        console.error(
            '🔴 Anomaly Detection Error:',
            error
        );

        return null;
    }
}

// =====================================================
// 11. CRON JOB
// =====================================================

export const startAnomalyDetector = () => {

    console.log(
        '🚨 AI Anomaly Detector started!'
    );

    console.log(
        '⏰ Anomaly check will run every 5 minutes.'
    );

    cron.schedule(
        '*/5 * * * *',
        async () => {

            console.log(
                '🔄 Running scheduled anomaly detection...'
            );

            try {

                const alert = await detectAnomalies();

                if (alert) {

                    console.log(
                        '🚨 ACTIVE ALERT:',
                        alert
                    );

                    // Future:
                    // await AlertModel.create(alert);
                    // await sendEmail(alert);

                }

            } catch (error) {

                console.error(
                    '🔴 Anomaly Cron Error:',
                    error
                );

            }

        }
    );
};
