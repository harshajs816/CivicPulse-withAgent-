import express from 'express';
import Report from '../models/reportSchema.js';
import { triggerManualTriage } from '../StateAgent.js';

const router = express.Router();

// ─────────────────────────────────────────────
// GET /api/agent/state-complaints?state=Rajasthan
// Returns all complaints for a state, sorted newest first
// ─────────────────────────────────────────────
router.get('/state-complaints', async (req, res) => {
    try {
        const { state } = req.query;
        if (!state) return res.status(400).json({ success: false, message: 'State is required' });

        const complaints = await Report.find({
            $or: [
                { state: { $regex: state, $options: 'i' } },
                { locationName: { $regex: state, $options: 'i' } }
            ]
        }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, complaints });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─────────────────────────────────────────────
// GET /api/agent/triage-queue?state=Rajasthan
// Returns only Pending + Unassigned complaints (the AI triage queue)
// ─────────────────────────────────────────────
router.get('/triage-queue', async (req, res) => {
    try {
        const { state } = req.query;
        if (!state) return res.status(400).json({ success: false, message: 'State is required' });

        const queue = await Report.find({
            $or: [
                { state: { $regex: state, $options: 'i' } },
                { locationName: { $regex: state, $options: 'i' } }
            ],
            status: 'Pending',
            department: 'Unassigned'
        }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, queue });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─────────────────────────────────────────────
// GET /api/agent/dept-stats?state=Rajasthan
// Returns per-department complaint counts + resolution rates
// ─────────────────────────────────────────────
router.get('/dept-stats', async (req, res) => {
    try {
        const { state } = req.query;
        if (!state) return res.status(400).json({ success: false, message: 'State is required' });

        const complaints = await Report.find({
            $or: [
                { state: { $regex: state, $options: 'i' } },
                { locationName: { $regex: state, $options: 'i' } }
            ]
        });

        const departments = ['Road', 'Water', 'Sanitation', 'Electricity', 'Drainage', 'Police'];

        const stats = departments.map(dept => {
            const deptComplaints = complaints.filter(c => c.department === dept);
            const total = deptComplaints.length;
            const resolved = deptComplaints.filter(c => c.status === 'Resolved').length;
            const pending = deptComplaints.filter(c => c.status === 'Pending').length;
            const inProgress = deptComplaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length;
            const escalated = deptComplaints.filter(c => c.status === 'Escalated').length;
            const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

            return { dept, total, resolved, pending, inProgress, escalated, resolutionRate };
        });

        // Summary totals
        const total = complaints.length;
        const unassigned = complaints.filter(c => c.department === 'Unassigned').length;
        const resolved = complaints.filter(c => c.status === 'Resolved').length;
        const escalated = complaints.filter(c => c.status === 'Escalated').length;

        res.status(200).json({
            success: true,
            summary: { total, unassigned, resolved, escalated },
            stats
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─────────────────────────────────────────────
// POST /api/agent/trigger-triage
// Manually trigger AI triage for a state from the dashboard
// Body: { state: "Rajasthan" }
// ─────────────────────────────────────────────
router.post('/trigger-triage', async (req, res) => {
    try {
        const { state } = req.body;
        if (!state) return res.status(400).json({ success: false, message: 'State is required' });

        const result = await triggerManualTriage(state);
        res.status(200).json({
            success: true,
            message: `AI triage complete. Processed ${result.processed} complaints.`,
            processed: result.processed
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─────────────────────────────────────────────
// POST /api/agent/escalate
// Escalate a single complaint to SuperAdmin
// Body: { complaintId }
// ─────────────────────────────────────────────
router.post('/escalate', async (req, res) => {
    try {
        const { complaintId } = req.body;
        if (!complaintId) return res.status(400).json({ success: false, message: 'complaintId is required' });

        await Report.findByIdAndUpdate(complaintId, { status: 'Escalated' });
        res.status(200).json({ success: true, message: 'Complaint escalated to SuperAdmin' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─────────────────────────────────────────────
// PATCH /api/agent/update-status
// Update status of a complaint
// Body: { complaintId, status }
// ─────────────────────────────────────────────
router.patch('/update-status', async (req, res) => {
    try {
        const { complaintId, status } = req.body;
        const validStatuses = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Escalated'];
        if (!complaintId || !status) return res.status(400).json({ success: false, message: 'complaintId and status are required' });
        if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

        const updated = await Report.findByIdAndUpdate(complaintId, { status }, { new: true });
        res.status(200).json({ success: true, complaint: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
