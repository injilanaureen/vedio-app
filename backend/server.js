require("dotenv").config();
const express = require('express');
const connectDB = require("./config/db");
const cors = require('cors');


const app = express();

// CORS configuration - Allow frontend URL
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://vedio-app-front.onrender.com',
  'https://vedio-app-frontend.onrender.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in production for now
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve static files with proper headers for video (handle range requests)
const path = require('path');
const fs = require('fs');

app.use("/uploads", (req, res, next) => {
  const filePath = path.join(__dirname, 'uploads', req.path);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Video file not found' });
  }
  
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;
  
  if (range) {
    // Handle range requests for video streaming
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    
    if (start >= fileSize || end >= fileSize) {
      res.writeHead(416, {
        'Content-Range': `bytes */${fileSize}`
      });
      return res.end();
    }
    
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/webm',
      'Access-Control-Allow-Origin': '*'
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    // Send full file
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/webm',
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*'
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// Connect to database
connectDB();

// Root route
app.get("/", (req, res) => {
    res.json({ 
        message: "Video App API is running!",
        endpoints: {
            auth: "/api/auth",
            video: "/api/vedio",
            admin: "/api/admin"
        }
    });
});

app.use("/api/auth", require("./routes/authRoutes"))
app.use("/api/vedio",require("./routes/vedioRoutes"))
app.use("/api/admin",require("./routes/adminRoutes"))

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => { 
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});






