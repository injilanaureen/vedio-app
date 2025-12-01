require("dotenv").config();
const express = require('express');
const connectDB = require("./config/db");
const cors = require('cors');


const app = express();
app.use(cors());
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

app.listen(process.env.PORT,()=>{ console.log(`Server is running on port ${process.env.PORT}`)})






