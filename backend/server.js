const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Secret key cho JWT
const JWT_SECRET = 'your_jwt_secret_key';

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Cho phép CORS
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, '../shared')));
app.use(express.static(path.join(__dirname, '../obs')));

// Fake user data
const users = [
    { username: 'admin', password: '12345' }, // Thông tin đăng nhập mẫu
];

// Endpoint: Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Tạo token JWT với thời hạn 7 ngày
        const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '7d' });
        res.status(200).send({ message: 'Login successful', token });
    } else {
        res.status(401).send({ message: 'Invalid username or password' });
    }
});

// Middleware: Xác thực JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Lấy token từ header Authorization

    if (!token) {
        return res.status(401).send({ message: 'Access Denied' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).send({ message: 'Invalid Token' });
        }

        req.user = user; // Lưu thông tin user từ token
        next();
    });
};

// Endpoint: Check Authentication
app.get('/check-auth', authenticateToken, (req, res) => {
    res.status(200).send({ authenticated: true, user: req.user });
});

// WebSocket Server với xác thực JWT
// wss.on('connection', (ws, req) => {
//     const url = new URL(req.url, `ws://${req.headers.host}`);
//     const token = url.searchParams.get('token'); // Lấy token từ query string

//     if (!token) {
//         console.log('Unauthorized WebSocket connection attempt: Missing token.');
//         ws.close(1008, 'Unauthorized');
//         return;
//     }

//     console.log(`WebSocket connection received. URL: ${url.href}`);
//     jwt.verify(token, JWT_SECRET, (err, user) => {
//         if (err) {
//             console.log('Unauthorized WebSocket connection attempt: Invalid token.');
//             ws.close(1008, 'Unauthorized');
//             return;
//         }

//         console.log(`WebSocket connection established for user: ${user.username}`);

//         ws.on('message', (message) => {
//             console.log('Message from client:', message);
//             ws.send(`Server received: ${message}`);
//         });

//         ws.on('close', () => {
//             console.log('WebSocket disconnected');
//         });
//     });
// });


wss.on('connection', (ws) => {
    console.log('WebSocket connection established');

    // Gửi tin nhắn chào mừng khi kết nối thành công
    ws.send(JSON.stringify({ type: 'welcome', message: 'Welcome to the WebSocket server!' }));

    ws.on('message', (message) => {
        console.log('Received message from client:', message);

        // Phát tín hiệu đến tất cả các client dưới dạng JSON
        const isJSON = (str) => {
            try {
                JSON.parse(str);
                return true;
            } catch (error) {
                return false;
            }
        };

        if (isJSON(message)) {
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        } else {
            console.error('Received non-JSON message, ignoring.');
        }
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

console.log('WebSocket server running on ws://localhost:3000');



// Khởi chạy HTTP Server
const HTTP_PORT = 3000;
server.listen(HTTP_PORT, () => {
    console.log(`HTTP & WebSocket server running on http://localhost:${HTTP_PORT}`);
});
