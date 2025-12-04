# Quick Start - Python TikTok Live Backend

## Cài đặt nhanh (5 phút)

### 1. Cài đặt Python
Cần Python 3.8 trở lên. Kiểm tra:
```bash
python --version
```

### 2. Khởi động Python Backend
**Cách đơn giản nhất:**
```bash
# Từ thư mục root của project
start-python-backend.bat
```

Script này sẽ tự động:
- Tạo virtual environment
- Cài đặt dependencies
- Khởi động server

**Hoặc manual:**
```bash
cd backend_python
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python server.py
```

### 3. Verify
Mở browser: http://127.0.0.1:5000/health

Nếu thấy:
```json
{
  "status": "healthy",
  "service": "Python TikTok Live Backend",
  "version": "1.0.0"
}
```
→ Thành công! ✅

## Sử dụng

### Với Frontend
1. Start Node.js backend: `cd backend && npm start`
2. Start Python backend: `start-python-backend.bat`
3. Mở frontend: http://localhost:3000
4. Vào **Fandom War** → Nhập username TikTok → Kết nối

### Test API trực tiếp

**Connect:**
```bash
curl -X POST http://127.0.0.1:5000/connect ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"tiktok_username\"}"
```

**Status:**
```bash
curl http://127.0.0.1:5000/status
```

**Disconnect:**
```bash
curl -X POST http://127.0.0.1:5000/disconnect
```

## Lấy SessionId Cookie (Nếu cần)

TikTok có thể yêu cầu sessionId khi kết nối:

1. Mở https://www.tiktok.com
2. Đăng nhập tài khoản
3. Nhấn F12 → Tab **Application**
4. Cookies → https://www.tiktok.com
5. Tìm `sessionid` → Copy giá trị
6. Dùng khi connect:
```bash
curl -X POST http://127.0.0.1:5000/connect ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"tiktok_username\",\"sessionId\":\"your_session_id_here\"}"
```

## Troubleshooting

### "Python is not installed"
→ Cài Python từ https://www.python.org/downloads/

### "No module named 'TikTokLive'"
```bash
cd backend_python
pip install -r requirements.txt
```

### "Failed to connect to TikTok Live"
- Kiểm tra username đúng và đang livestream
- Thử thêm sessionId cookie (xem hướng dẫn ở trên)

### "WebSocket connection failed"
→ Đảm bảo Node.js backend đang chạy trên port 3000

## Next Steps

- Đọc `README.md` để biết thêm chi tiết
- Xem `TESTING.md` để test đầy đủ
- Xem `PYTHON_INTEGRATION.md` để hiểu kiến trúc

## Support

Thư viện TikTokLive: https://github.com/isaackogan/TikTokLive  
Documentation: https://isaackogan.github.io/TikTokLive/

