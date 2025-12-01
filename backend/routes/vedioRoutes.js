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
        const normalizedPath = req.file.path.replace(/\\/g, '/');
        
        const video = await Video.create({
            user_id: userId,
            file_path: normalizedPath
        });
        
        res.json({ video });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});
module.exports = router;

