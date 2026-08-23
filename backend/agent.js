import dotenv from 'dotenv';
import cron from 'node-cron';
import { GoogleGenAI } from '@google/genai';
import mongoose from 'mongoose';
import Report from './models/reportSchema.js';

dotenv.config();

// =====================================================
// 1. AI SETUP
// =====================================================

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

// =====================================================
// 2. DATABASE CONNECTION
// =====================================================

mongoose
    .connect(
        process.env.MONGO_URI ||
        'mongodb://127.0.0.1:27017/civicpulse'
    )
    .then(() => {
        console.log('🟢 Database Connected for AI Agent!');
    })
    .catch((err) => {
        console.error(
            '🔴 Database Connection Error:',
            err
        );
    });

// =====================================================
// 3. REAL-TIME DATA FUNCTION
// =====================================================

async function getRealTimeData() {
    try {
        const stats = await Report.aggregate([
            {
                $match: {
                    status: {
                        $in: ['Pending', 'In Progress']
                    }
                }
            },

            {
                $group: {
                    _id: '$category',

                    total_issues: {
                        $sum: 1
                    },

                    high_priority: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        '$priority',
                                        'high'
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        const formattedData = {};

        stats.forEach((item) => {
            formattedData[item._id] = {
                total_issues: item.total_issues,
                high_priority: item.high_priority
            };
        });

        return formattedData;

    } catch (error) {
        console.error(
            '🔴 Database fetch error in AI Agent:',
            error
        );

        return null;
    }
}

// =====================================================
// 4. MAIN AI FUNCTION
// =====================================================

export async function generateReport() {

    console.log(
        '⏳ AI Agent database se real-time data analyze kar raha hai...'
    );

    try {

        // Get latest data from MongoDB
        const data = await getRealTimeData();

        // No pending issues
        if (
            !data ||
            Object.keys(data).length === 0
        ) {
            const msg =
                '✅ All clear! Aaj ke liye koi pending issue nahi hai.';

            console.log(msg);

            return msg;
        }

        // =================================================
        // AI PROMPT
        // =================================================

        const prompt = `
You are the Chief Data Analyst of CivicPulse, a smart city platform.

Here is the live pending civic issue data:

${JSON.stringify(data, null, 2)}

Analyze this data and provide EXACTLY 3 short bullet points.

The report must be:
- Professional
- Action-oriented
- Based only on the provided data
- Easy for government authorities to understand

Cover:

1. Which department/category has the most issues or high-priority issues?
2. Where should authorities take immediate action?
3. What is the most important overall recommendation?

Do not add an introduction or conclusion.

Return exactly 3 bullet points.
`;

        // =================================================
        // GEMINI API CALL
        // =================================================

        const result = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: prompt,
        });

        // IMPORTANT:
        // generateContent() result is stored in "result"
        // so we must use result.text
        const reportText = result.text;

        console.log('✅ AI Report Ready!');
        console.log('--------------------------------');
        console.log(reportText);
        console.log('--------------------------------');

        return reportText;

    } catch (error) {

        console.error(
            '🔴 Gemini AI Error:',
            error
        );

        return '❌ Report generate karne mein error aaya.';
    }
}

// =====================================================
// 5. CRON JOB
// =====================================================

// export const startAiAgent = () => {

//     console.log(
//         '🚀 Real-Time AI Agent start ho gaya hai.'
//     );

//     console.log(
//         '⏰ Har 1 minute mein report generate hogi...'
//     );

//     cron.schedule('* * * * *', async () => {

//         try {

//             await generateReport();

//         } catch (error) {

//             console.error(
//                 '🔴 AI Agent Cron Error:',
//                 error
//             );

//         }

//     });
// };

// =====================================================
// 6. START AI AGENT
// =====================================================

// startAiAgent();
