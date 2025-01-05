const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, update } = require('firebase/database');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const WebSocket = require('ws');
const http = require('http');
require('dotenv').config();


// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA50Q6ZCeUArjmKUFTl7X3xjRnG4n6kGCc",
    authDomain: "licensebanpickaov.firebaseapp.com",
    databaseURL: "https://licensebanpickaov-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "licensebanpickaov",
    storageBucket: "licensebanpickaov.appspot.com",
    messagingSenderId: "732035962867",
    appId: "1:732035962867:web:e8db7d2d370a8ec3ea2486",
    measurementId: "G-ZSD0RHPKL3"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET;


// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, '../shared')));
app.use(express.static(path.join(__dirname, '../obs')));

// Middleware: Xác thực JWT
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).send({ message: 'Không có token' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Lưu thông tin đã giải mã vào req.user
        next();
    } catch (err) {
        console.error('Invalid token:', err);
        res.status(403).send({ message: 'Token không hợp lệ' });
    }
};

// Middleware: Xác thực quyền admin
const authenticateAdmin = (req, res, next) => {
    if (req.user.username !== 'admin') {
        return res.status(403).send({ message: 'Bạn không có quyền truy cập.' });
    }
    next();
};

// API: Kích hoạt License Key
app.post('/activate', async (req, res) => {
    const { licenseKey, deviceId } = req.body;

    if (!licenseKey || !deviceId) {
        return res.status(400).send({ message: 'Thiếu License Key hoặc Device ID' });
    }

    try {
        // Tham chiếu đến License Key trong Firebase
        const licenseRef = ref(database, `licenses/${licenseKey}`);
        const snapshot = await get(licenseRef);

        if (!snapshot.exists()) {
            return res.status(404).send({ message: 'License Key không tồn tại' });
        }

        const licenseData = snapshot.val();

        if (!licenseData.active) {
            return res.status(403).send({ message: 'License Key đã bị thu hồi!' });
        }

        if (licenseData.deviceId && licenseData.deviceId !== deviceId) {
            return res.status(403).send({ message: 'License Key đã được sử dụng trên thiết bị khác!' });
        }

        // Cập nhật Device ID trong Firebase
        await update(licenseRef, { ...licenseData, deviceId });

        // Tạo JWT Token
        const token = jwt.sign({ licenseKey, deviceId }, JWT_SECRET, { expiresIn: '7d' });

        res.status(200).send({ message: 'Kích hoạt thành công!', token });
    } catch (error) {
        console.error('Error activating license:', error);
        res.status(500).send({ message: 'Đã xảy ra lỗi. Vui lòng thử lại sau.' });
    }
});

// Endpoint: List Licenses (Admin Only)
app.get('/list-licenses', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
        const licensesRef = ref(database, 'licenses');
        const snapshot = await get(licensesRef);

        if (!snapshot.exists()) {
            return res.status(200).send([]); // Trả về mảng rỗng nếu không có license
        }

        const licenses = Object.entries(snapshot.val()).map(([licenseKey, licenseData]) => ({
            licenseKey,
            ...licenseData,
        }));

        res.status(200).send(licenses); // Trả về mảng License Key
    } catch (error) {
        console.error('Error fetching licenses:', error);
        res.status(500).send({ message: 'Lỗi khi lấy danh sách License Key' });
    }
});

// Endpoint: Check License
app.get('/check-license', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).send({ message: 'Không có token' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { licenseKey } = decoded;

        // Fetch license key from Firebase Realtime Database
        const licenseRef = ref(database, `licenses/${licenseKey}`);
        get(licenseRef).then((snapshot) => {
            if (!snapshot.exists() || !snapshot.val().active) {
                return res.status(403).send({ message: 'License Key không hợp lệ hoặc đã bị vô hiệu hóa' });
            }

            res.send({ message: 'License Key hợp lệ' });
        });
    } catch (err) {
        console.error('Error in /check-license:', err);
        res.status(403).send({ message: 'Token không hợp lệ' });
    }
});

// Endpoint: Revoke License (Admin Only)
app.post('/revoke-license', authenticateToken, authenticateAdmin, async (req, res) => {
    const { licenseKey } = req.body;

    if (!licenseKey) {
        return res.status(400).send({ message: 'Thiếu License Key' });
    }

    try {
        // Tham chiếu đến License Key trong Firebase
        const licenseRef = ref(database, `licenses/${licenseKey}`);
        const snapshot = await get(licenseRef);

        if (!snapshot.exists()) {
            return res.status(404).send({ message: 'License Key không tồn tại' });
        }

        // Cập nhật trạng thái "active" của License Key thành false
        await update(licenseRef, { ...snapshot.val(), active: false });

        res.status(200).send({ message: `License Key "${licenseKey}" đã được thu hồi.` });
    } catch (error) {
        console.error('Error revoking license:', error);
        res.status(500).send({ message: 'Đã xảy ra lỗi. Vui lòng thử lại.' });
    }
});


// WebSocket Server
wss.on('connection', (ws) => {
    console.log('WebSocket connection established');

    // Send welcome message
    ws.send(JSON.stringify({ type: 'welcome', message: 'Welcome to the WebSocket server!' }));

    ws.on('message', (message) => {
        console.log('Received message from client:', message);

        // Broadcast message to all connected clients
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

console.log('WebSocket server running on ws://localhost:3000');

// Start HTTP Server
const HTTP_PORT = 3000;
server.listen(HTTP_PORT, () => {
    console.log(`HTTP & WebSocket server running on http://localhost:${HTTP_PORT}`);
});
