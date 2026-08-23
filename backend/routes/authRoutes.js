import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/User.js'; // Apna User model ka correct path check kar lein

const router = express.Router();


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ==========================================
// 1. REGISTER API (Creates User & Sends OTP)
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: "Email already registered!" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60000); // Valid for 10 minutes

    // Create New User (isVerified will be false by default in Schema)
    user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'USER', // Default role Citizen
      department: department || null,
      otp,
      otpExpiry
    });

    await user.save();

    // Send OTP via Email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your CivicPulse Account',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc; border-radius: 10px;">
          <h2 style="color: #06b6d4; text-align: center;">Welcome to CivicPulse!</h2>
          <p style="color: #334155;">Hello <strong>${name}</strong>,</p>
          <p style="color: #334155;">Thank you for registering. Please use the following OTP to verify your email address:</p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a; background-color: #e2e8f0; padding: 10px 20px; border-radius: 8px;">
              ${otp}
            </span>
          </div>
          <p style="color: #ef4444; font-size: 12px; text-align: center;">This OTP is valid for 10 minutes only.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.status(201).json({ 
      success: true, 
      message: "Registration successful! OTP sent to your email." 
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: "Registration failed due to server error" });
  }
});

// ==========================================
// 2. VERIFY OTP API
// ==========================================
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Account is already verified!" });
    }

    // Validate OTP and Expiry Time
    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP!" });
    }
    
    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP has expired! Please request a new one." });
    }

    // If OTP is correct, mark user as verified and clear OTP data
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: "Email verified successfully! You can now log in." 
    });

  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ success: false, message: "Verification failed due to server error" });
  }
});

// ==========================================
// 3. LOGIN API (With Verification Check)
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find User
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    // IMPORTANT: Check if user's email is verified
    if (!user.isVerified) {
      return res.status(403).json({ 
        success: false, 
        message: "Please verify your email address before logging in." 
      });
    }

    // Validate Password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ success: false, message: "Invalid credentials!" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'civic_pulse_secret_key', 
      { expiresIn: '1d' }
    );

    // Send successful response with user details for Dashboard Routing
    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department // Crucial for Department Dashboard logic
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Login failed due to server error" });
  }
});

export default router;