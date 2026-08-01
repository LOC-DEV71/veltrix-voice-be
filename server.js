require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const routes = require('./routes'); // Chỉ import 1 index duy nhất từ routes/

const app = express();

// Kết nối MongoDB Atlas
connectDB();

// 1. CORS Universal Middleware: Hỗ trợ 100% mọi Domain, Localhost, Vercel, Railway và file:///
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && origin !== 'null') {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-api-key, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Đăng ký Router chính (routes/index.js sẽ tự phân luồng /client và /admin)
app.use('/api', routes);

// Health check endpoint tại root /
app.get('/', (req, res) => {
    res.json({
        service: "Veltrix Voice SaaS API",
        architecture: "MVC Modular + Client/Admin Separation",
        endpoints: {
            client: "/api/client/*",
            admin: "/api/admin/*"
        },
        database: "MongoDB Atlas Connected",
        environment: process.env.NODE_ENV || 'production',
        status: "Running"
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Backend Veltrix Voice SaaS Server đang chạy tại: http://localhost:${PORT}`);
});
