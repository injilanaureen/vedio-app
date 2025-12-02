const express = require('express');
const router = express.Router();
const multer = require('multer');
const Video = require('../models/Video');

// Video routes will be added here

const storage = multer.diskStorage({
    destination:"uploads/",
    filename:(req,file,cb)=>{
        cb(null,Date.now()+file.originalname);
    }
})

const upload = multer({storage:storage});

// Get user's videos - MUST be before /upload route
router.get("/my-videos/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        console.log('Fetching videos for user:', userId);
        const videos = await Video.find({ user_id: userId })
            .sort({ created_at: -1 }); // Latest first
        console.log('Found videos:', videos.length);
        res.json(videos);
    } catch (error) {
        console.error('Get videos error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post("/upload", upload.single("video"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No video file uploaded' });
        }

        const userId = req.body.userId;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Normalize path: replace backslashes with forward slashes for URLs
        // Ensure path starts with 'uploads/' not absolute path
        let normalizedPath = req.file.path.replace(/\\/g, '/');
        if (!normalizedPath.startsWith('uploads/')) {
            // Extract just the filename if full path
            const filename = normalizedPath.split('/').pop() || normalizedPath.split('\\').pop();
            normalizedPath = `uploads/${filename}`;
        }
        
        console.log('Uploading video:', {
            originalPath: req.file.path,
            normalizedPath: normalizedPath,
            userId: userId,
            fileSize: req.file.size
        });
        
        const video = await Video.create({
            user_id: userId,
            file_path: normalizedPath
        });
        
        console.log('Video saved:', video);
        res.json({ video });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});
module.exports = router;

