# Python TikTok Live Backend

Backend Python để xử lý kết nối TikTok Live sử dụng thư viện `TikTokLive` (isaackogan).

## Tính năng

- Kết nối với TikTok Live stream
- Xử lý real-time comments, gifts, và viewer count
- Forward events tới Node.js backend qua WebSocket
- Auto-reconnect khi mất kết nối
- HTTP API để điều khiển connection

## Cài đặt

### 1. Cài đặt Python 3.8+

Đảm bảo bạn đã cài Python 3.8 hoặc cao hơn:
```bash
python --version
```

### 2. Cài đặt Dependencies

```bash
cd backend_python
pip install -r requirements.txt
```

Hoặc sử dụng virtual environment (khuyến nghị):
```bash
cd backend_python
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 3. Cấu hình

Copy file `.env.example` thành `.env` và điều chỉnh nếu cần:
```bash
copy .env.example .env
```

## Chạy Server

### Cách 1: Sử dụng batch script (khuyến nghị)
```bash
# Từ thư mục root của project
start-python-backend.bat
```

### Cách 2: Chạy trực tiếp
```bash
cd backend_python
python server.py
```

Server sẽ chạy trên `http://127.0.0.1:5000`

## API Endpoints

### POST /connect
Kết nối với TikTok Live stream

**Request Body:**
```json
{
  "username": "tiktok_username",
  "sessionId": "optional_session_cookie"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Connected to TikTok Live",
  "data": {
    "username": "tiktok_username",
    "roomId": "...",
    "isConnected": true
  }
}
```

### POST /disconnect
Ngắt kết nối khỏi TikTok Live

**Response:**
```json
{
  "success": true,
  "message": "Disconnected from TikTok Live"
}
```

### GET /status
Kiểm tra trạng thái kết nối

**Response:**
```json
{
  "success": true,
  "data": {
    "isConnected": true,
    "username": "tiktok_username",
    "websocketConnected": true
  }
}
```

### GET /health
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "service": "Python TikTok Live Backend",
  "version": "1.0.0"
}
```

## Kiến trúc

```
┌─────────────┐     WebSocket      ┌──────────────┐     WebSocket     ┌──────────┐
│   TikTok    │ ←─────────────────→ │    Python    │ ──────────────→  │  Node.js │
│    Live     │                      │   Backend    │                   │  Backend │
└─────────────┘                      └──────────────┘                   └──────────┘
                                            │                                  │
                                            │                                  │
                                            ↓                                  ↓
                                     HTTP API (5000)               WebSocket Server (3000)
                                                                           │
                                                                           ↓
                                                                      ┌──────────┐
                                                                      │ Frontend │
                                                                      └──────────┘
```

## Event Types

Python server forward các events sau tới Node.js:

### tiktok-comment
```json
{
  "type": "tiktok-comment",
  "data": {
    "username": "user123",
    "nickname": "User Display Name",
    "text": "Hello!",
    "timestamp": "2024-12-04T10:30:00.000Z",
    "profilePictureUrl": "https://...",
    "userId": "123456",
    "isGift": false,
    "giftName": "",
    "giftCount": 0
  }
}
```

### tiktok-gift
```json
{
  "type": "tiktok-comment",
  "data": {
    "username": "user123",
    "nickname": "User Display Name",
    "text": "🎁 Tặng Rose x5",
    "timestamp": "2024-12-04T10:30:00.000Z",
    "isGift": true,
    "giftName": "Rose",
    "giftCount": 5,
    "giftId": 5655
  }
}
```

### tiktok-viewers
```json
{
  "type": "tiktok-viewers",
  "data": {
    "viewerCount": 1234
  }
}
```

### tiktok-connected
```json
{
  "type": "tiktok-connected",
  "data": {
    "username": "tiktok_username",
    "viewerCount": 100
  }
}
```

### tiktok-disconnected
```json
{
  "type": "tiktok-disconnected",
  "data": {
    "reason": "Stream ended"
  }
}
```

### tiktok-error
```json
{
  "type": "tiktok-error",
  "data": {
    "error": "Error message"
  }
}
```

## Troubleshooting

### Lỗi kết nối TikTok
- Đảm bảo username đúng và đang live
- Cung cấp sessionId cookie nếu TikTok yêu cầu đăng nhập

### Lỗi WebSocket
- Kiểm tra Node.js server đã chạy chưa (port 3000)
- Kiểm tra cấu hình `NODEJS_WS_URL` trong `.env`

### Lỗi dependencies
- Cập nhật pip: `python -m pip install --upgrade pip`
- Cài lại dependencies: `pip install -r requirements.txt --force-reinstall`

## Development

### Testing connection manually
```bash
# Terminal 1: Start Node.js backend
cd backend
npm start

# Terminal 2: Start Python backend
cd backend_python
python server.py

# Terminal 3: Test connection
curl -X POST http://localhost:5000/connect \
  -H "Content-Type: application/json" \
  -d '{"username":"tiktok_username"}'
```

## License

MIT License - See main project LICENSE file

