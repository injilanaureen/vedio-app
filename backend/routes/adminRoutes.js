const router = require("express").Router();
const Video = require("../models/Video");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const Email = require("../models/Email");

// get all videos with user email
router.get("/videos", async (req, res) => {
  try {
    const videos = await Video.find().populate("user_id", "email");
    res.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get email logs
router.get("/email-logs", async (req, res) => {
  try {
    const emails = await Email.find()
      .populate('sent_by', 'email')
      .sort({ sent_at: -1 }); // Latest first
    res.json(emails);
  } catch (error) {
    console.error('Get email logs error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete video (admin can delete any video)
router.delete("/delete-video/:videoId", async (req, res) => {
  try {
    const { videoId } = req.params;
    const Video = require("../models/Video");
    const video = await Video.findById(videoId);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Delete video file
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '..', video.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Video.findByIdAndDelete(videoId);
    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ error: error.message });
  }
});

// send email
router.post("/send-email", async (req, res) => {
  try {
    const { email, subject, message, adminId } = req.body;

    if (!email || !message) {
      return res.status(400).json({ error: 'Email and message are required' });
    }

    // TODO: Configure SMTP credentials in environment variables
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "admin@gmail.com",
        pass: process.env.EMAIL_PASS || "your-app-password" // Gmail app password required
      }
    });

    let emailLog;
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER || "admin@gmail.com",
        to: email,
        subject: subject || "Message from Admin",
        text: message
      });

      // Log successful email
      emailLog = await Email.create({
        to: email,
        subject: subject || "Message from Admin",
        message: message,
        sent_by: adminId,
        status: 'sent'
      });

      res.json({ success: true, message: 'Email sent successfully', emailLog });
    } catch (emailError) {
      // Log failed email
      emailLog = await Email.create({
        to: email,
        subject: subject || "Message from Admin",
        message: message,
        sent_by: adminId,
        status: 'failed',
        error: emailError.message
      });

      throw emailError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send email: ' + error.message });
  }
});

module.exports = router;
