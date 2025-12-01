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
app.use("/uploads", express.static("uploads"));

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






