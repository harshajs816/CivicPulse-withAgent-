import express from "express";
import { reportRegister } from "../controllers/reportController.js";
import Report from "../models/reportSchema.js"; // use your actual filename

const router = express.Router();

router.post("/create", reportRegister);

router.get("/all", async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reports
    });
  } catch (error) {
    console.error("Error fetching reports:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch reports"
    });
  }
});

// LIKE / DISLIKE API
router.post('/:id/interact', async (req, res) => {
  try {
    const { action, userId } = req.body; // action can be 'like' or 'dislike'
    const report = await Report.findById(req.params.id);

    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    // Remove user from both arrays first to reset their vote
    report.likes = report.likes.filter(id => id !== userId);
    report.dislikes = report.dislikes.filter(id => id !== userId);

    // Add vote based on action
    if (action === 'like') {
      report.likes.push(userId);
    } else if (action === 'dislike') {
      report.dislikes.push(userId);
    } // if action is 'none', it just removes the previous vote

    await report.save();
    res.json({ success: true, likes: report.likes, dislikes: report.dislikes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// COMMENT API
router.post('/:id/comment', async (req, res) => {
  try {
    const { userId, name, text } = req.body;
    const report = await Report.findById(req.params.id);
    
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    const newComment = { userId, name, text, createdAt: new Date() };
    report.comments.push(newComment);
    
    await report.save();
    res.json({ success: true, comments: report.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT API - Withdraw a report (Soft Delete)
router.put('/:id/withdraw', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Status ko Withdrawn kar diya
    report.status = 'Withdrawn';
    await report.save();
    
    res.json({ success: true, message: 'Report successfully withdrawn', report });
  } catch (error) {
    console.error("Withdraw Error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
// UPDATE REPORTS
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, message: 'Status updated', report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE API - Delete report
router.delete('/:id', async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Report deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
