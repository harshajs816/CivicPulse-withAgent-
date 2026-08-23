import Report from "../models/reportSchema.js";

export const reportRegister = async (req, res) => {
  try {
    const {
      title,
      category,
      priority,
      locationName,
      coordinates,
      description,
      reportedBy,
      image
    } = req.body;

    const newReport = new Report({
      title,
      category,
      priority,
      locationName,
      coordinates,
      description,
      reportedBy,
      image
    });

    await newReport.save();

    res.status(201).json({
      success: true,
      message: "Report submitted successfully!",
      report: newReport
    });
  } catch (error) {
    console.error("Report Creation Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};
