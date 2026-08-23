import cron from 'node-cron';
import nodemailer from 'nodemailer';
import Report from './models/reportSchema.js';

// =====================================================
// 1. EMAIL TRANSPORTER
// =====================================================

const transporter = nodemailer.createTransport({
    service: 'gmail',

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// =====================================================
// 2. DEPARTMENT EMAIL MAPPING
// =====================================================

const departmentEmails = {
    water: 'water.admin@civicpulse.com',
    road: 'road.admin@civicpulse.com',
    sanitation: 'sanitation.admin@civicpulse.com',
    electricity: 'power.admin@civicpulse.com',
    other: 'general.admin@civicpulse.com'
};

// =====================================================
// 3. GENERATE ESCALATION EMAIL
// =====================================================

function generateEscalationEmail(department, overdueCount, sampleIssues) {

    const departmentName =
        department.charAt(0).toUpperCase() +
        department.slice(1);

    const issueList = sampleIssues
        .slice(0, 3)
        .map((issue) => `- ${issue}`)
        .join('\n');

    return `
Dear ${departmentName} Department,

This is an automated escalation from CivicPulse regarding ${overdueCount} civic complaint(s) that have remained pending for more than 48 hours.

The following reported issues are among the overdue complaints:

${issueList}

Please review these complaints and take appropriate action at the earliest possible opportunity. Timely resolution will help improve citizen satisfaction and prevent further escalation.

Regards,
CivicPulse Automated Escalation System
`.trim();
}

// =====================================================
// 4. AUTO ESCALATION PROCESS
// =====================================================

export async function processAutoEscalation() {

    try {

        console.log(
            '⏳ Checking for overdue complaints...'
        );

        // -------------------------------------------------
        // 48 HOURS AGO
        // -------------------------------------------------

        const fortyEightHoursAgo = new Date(
            Date.now() - 48 * 60 * 60 * 1000
        );

        // -------------------------------------------------
        // FIND OVERDUE REPORTS
        // -------------------------------------------------

        const overdueReports = await Report.aggregate([

            {
                $match: {
                    status: 'Pending',

                    createdAt: {
                        $lte: fortyEightHoursAgo
                    }
                }
            },

            {
                $group: {

                    _id: '$category',

                    overdueCount: {
                        $sum: 1
                    },

                    sampleIssues: {
                        $push: '$description'
                    }

                }
            }

        ]);

        // -------------------------------------------------
        // NO OVERDUE REPORTS
        // -------------------------------------------------

        if (overdueReports.length === 0) {

            console.log(
                '✅ No overdue complaints. Departments are doing well.'
            );

            return;
        }

        console.log(
            `🚨 ${overdueReports.length} department(s) have overdue complaints.`
        );

        // =================================================
        // 5. SEND EMAILS
        // =================================================

        for (const dept of overdueReports) {

            const department =
                String(dept._id || 'other').toLowerCase();

            const targetEmail =
                departmentEmails[department] ||
                departmentEmails.other;

            const departmentName =
                department.charAt(0).toUpperCase() +
                department.slice(1);

            // -------------------------------------------------
            // Generate email body
            // -------------------------------------------------

            const emailBody = generateEscalationEmail(
                department,
                dept.overdueCount,
                dept.sampleIssues
            );

            // -------------------------------------------------
            // Mail options
            // -------------------------------------------------

            const mailOptions = {

                from: process.env.EMAIL_USER,

                to: targetEmail,

                subject:
                    `⚠️ URGENT ESCALATION: ${dept.overdueCount} Overdue Complaints in ${departmentName} Dept`,

                text: emailBody

            };

            // -------------------------------------------------
            // Send email
            // -------------------------------------------------

            await transporter.sendMail(mailOptions);

            console.log(
                `📧 Warning email sent successfully to ${departmentName} department (${targetEmail})`
            );
        }

    } catch (error) {

        console.error(
            '🔴 Auto-Escalation Error:',
            error
        );

    }
}

// =====================================================
// 6. START EMAIL AGENT
// =====================================================

export const startEmailAgent = () => {

    console.log(
        '📧 CivicPulse Email Escalation Agent started!'
    );

    console.log(
        '⏰ Overdue complaints will be checked every day at 8:00 AM.'
    );

    cron.schedule(
        '0 8 * * *',
        async () => {

            console.log(
                '🔄 Running scheduled email escalation check...'
            );

            await processAutoEscalation();

        }
    );
};