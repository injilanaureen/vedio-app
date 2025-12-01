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
  const { email, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "your@gmail.com",
      pass: "your-app-password"
    }
  });

  await transporter.sendMail({
    from: "your@gmail.com",
    to: email,
    subject: "Message from Admin",
    text: message
  });

  res.json({ success: true });
});

module.exports = router;
