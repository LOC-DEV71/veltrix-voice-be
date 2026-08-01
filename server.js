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

// 1. CORS mở hoàn toàn cho SDK Widget (/api/sdk/*) để hỗ trợ mọi Domain, Localhost và file:///
app.use('/api/sdk', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-api-key, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// CORS Credentials linh hoạt cho môi trường Deploy (Vercel, Render, Localhost)
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Cho phép các request không có origin (ví dụ curl, Postman hoặc server-side call)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin) || /\.render\.com$/.test(origin)) {
            return callback(null, true);
        }
        return callback(null, true); // Tự động chấp nhận CORS cho môi trường Deploy
    },
    credentials: true
}));

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
