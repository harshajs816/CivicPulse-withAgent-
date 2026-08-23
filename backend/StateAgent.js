import { GoogleGenAI } from '@google/genai';
import Report from './models/reportSchema.js';
import cron from 'node-cron';
import { STATE_NAMES } from './config/statesConfig.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const VALID_DEPTS = ['Road', 'Water', 'Sanitation', 'Electricity', 'Drainage', 'Police'];

// Process unassigned complaints for a specific state using Gemini AI
export async function processStateComplaints(targetState) {
    console.log(`🤖 ${targetState} State Agent starting triage...`);

    try {
        const pendingComplaints = await Report.find({
            $or: [
                { state: { $regex: targetState, $options: 'i' } },
                { locationName: { $regex: targetState, $options: 'i' } }
            ],
            status: 'Pending',
            department: 'Unassigned'
        }).limit(10);

        if (pendingComplaints.length === 0) {
            console.log(`✅ All clear for ${targetState}. No unassigned complaints.`);
            return { processed: 0 };
        }

        console.log(`🔍 Found ${pendingComplaints.length} complaints to triage for ${targetState}.`);

        let processed = 0;

        for (const complaint of pendingComplaints) {
            try {
                const prompt = `
You are the AI routing agent for ${targetState} in the CivicPulse civic complaint system.
A citizen has submitted this complaint:
Title: "${complaint.title}"
Description: "${complaint.description}"

Based on this, assign it to EXACTLY ONE department from this list:
Road, Water, Sanitation, Electricity, Drainage, Police

Reply with ONLY the department name. No extra words, no punctuation.
                `.trim();

                const result = await ai.models.generateContent({
                    model: 'gemini-2.0-flash',
                    contents: prompt,
                });

                const rawDept = result.text.trim();
                const assignedDept = VALID_DEPTS.find(
                    d => d.toLowerCase() === rawDept.toLowerCase()
                ) || 'Unassigned';

                complaint.department = assignedDept;
                complaint.status = 'Assigned';

                await complaint.save();
                processed++;
                console.log(`➡️  "${complaint.title}" → ${assignedDept} Dept`);

            } catch (aiError) {
                console.error(`⚠️  AI failed for complaint "${complaint.title}":`, aiError.message);
            }
        }

        return { processed };

    } catch (error) {
        console.error(`❌ Error in ${targetState} State Agent:`, error);
        return { processed: 0, error: error.message };
    }
}

// Triggered manually from the dashboard
export async function triggerManualTriage(targetState) {
    return await processStateComplaints(targetState);
}

// Cron: runs every 2 minutes for all states defined in statesConfig
export const startAllStateAgents = () => {
    cron.schedule('*/2 * * * *', async () => {
        console.log(`⏰ State Agent cron triggered for ${STATE_NAMES.length} states...`);
        for (const state of STATE_NAMES) {
            await processStateComplaints(state);
        }
    });

    console.log(`✅ All State Agents started (${STATE_NAMES.join(', ')}) — running every 2 minutes.`);
};
