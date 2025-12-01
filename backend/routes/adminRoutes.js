const router = require("express").Router();
const Video = require("../models/Video");
const nodemailer = require("nodemailer");
const User = require("../models/User");

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

// send email
router.post("/send-email", async (req, res) => {
  try {
    const { email, subject, message } = req.body;

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

    await transporter.sendMail({
      from: process.env.EMAIL_USER || "admin@gmail.com",
      to: email,
      subject: subject || "Message from Admin",
      text: message
    });

    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send email: ' + error.message });
  }
});

module.exports = router;
