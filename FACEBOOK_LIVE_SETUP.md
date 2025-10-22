# 📘 Hướng dẫn Setup Facebook Live cho Fandom War

## 🎯 Tổng quan

Để sử dụng Fandom War với Facebook Live, bạn cần:
1. **Video ID**: ID của video đang live
2. **Page Access Token**: Token để truy cập Facebook Graph API

---

## 📝 Bước 1: Tạo Facebook App

### 1.1 Truy cập Facebook Developers
1. Đi đến: https://developers.facebook.com/
2. Đăng nhập với tài khoản Facebook của bạn
3. Click **"My Apps"** → **"Create App"**

### 1.2 Chọn loại App
- Chọn: **"Business"** hoặc **"Other"**
- Đặt tên app (VD: "FandomWar Live")
- Click **"Create App"**

### 1.3 Thêm Facebook Login
1. Trong dashboard app, click **"Add Product"**
2. Tìm **"Facebook Login"** → Click **"Set Up"**
3. Chọn **"Web"**

---

## 🔑 Bước 2: Lấy Page Access Token

### 2.1 Sử dụng Graph API Explorer
1. Truy cập: https://developers.facebook.com/tools/explorer/
2. Chọn App bạn vừa tạo (góc trên bên phải)
3. Click **"Generate Access Token"**
4. Cấp quyền:
   - `pages_read_engagement` - Đọc comments từ Page
   - `pages_manage_engagement` - Quản lý tương tác
5. Copy **Access Token**

### 2.2 Convert sang Page Access Token
1. Trong Graph API Explorer, chọn **"Get Page Access Token"**
2. Chọn Facebook Page của bạn
3. Copy **Page Access Token** này (token sẽ không hết hạn)

**⚠️ LƯU Ý**: Giữ Access Token bí mật! Không share công khai.

---

## 📹 Bước 3: Lấy Live Video ID

### Cách 1: Từ URL Live Video
Khi đang live, URL Facebook Live có dạng:
```
https://www.facebook.com/[page-id]/videos/[VIDEO_ID]/
```

**VIDEO_ID** chính là số bạn cần.

**Ví dụ**:
```
https://www.facebook.com/123456789/videos/987654321/
                                        ^^^^^^^^^ 
                                        Video ID
```

### Cách 2: Dùng Graph API
1. Truy cập: https://developers.facebook.com/tools/explorer/
2. Nhập query:
   ```
   /me/live_videos?fields=id,title,status&limit=5
   ```
3. Click **"Submit"**
4. Tìm video đang **"LIVE"**, copy **ID** của nó

---

## 🚀 Bước 4: Sử dụng trong PCastPro

### 4.1 Trong Frontend
1. Mở trang Manager (`index.html`)
2. Trong phần **Fandom War**:
   - Chọn **Platform**: "Facebook Live"
   - Nhập **Video ID** (VD: `987654321`)
   - Nhập **Page Access Token** (token bạn vừa lấy)
   - Click **"Kết nối"**

### 4.2 Setup Keywords & Đếm Vote
- Giống như TikTok Live
- Nhập từ khóa cho Team A và Team B
- Chỉ comments có từ khóa chính xác sẽ được đếm

---

## 🔄 Cách hoạt động

1. **Polling**: Backend sẽ poll comments từ Facebook mỗi 2 giây
2. **Comments**: Chỉ comments mới (sau khi kết nối) được xử lý
3. **Vote Counting**: Comments chứa keywords sẽ được đếm vote
4. **Real-time**: Votes được broadcast qua WebSocket đến OBS views

---

## ⚠️ Lưu ý quan trọng

### Giới hạn API
- Facebook Graph API có rate limit
- Poll interval: 2 giây (đã optimize)
- Tránh connect/disconnect liên tục

### Permissions
- Token cần quyền đọc comments từ Page
- Chỉ hoạt động với **Facebook Page**, không phải Profile cá nhân

### Token Expiration
- User Access Token: Hết hạn sau 60 ngày
- Page Access Token: Không hết hạn (nếu tạo đúng cách)
- Nếu token hết hạn, cần lấy token mới

---

## 🐛 Troubleshooting

### Lỗi: "Access token expired"
**Giải pháp**: Lấy Page Access Token mới theo Bước 2

### Lỗi: "Video not found"
**Giải pháp**: 
- Kiểm tra Video ID có đúng không
- Đảm bảo video đang LIVE
- Kiểm tra token có quyền truy cập video

### Không nhận được comments
**Giải pháp**:
- Đợi 2-5 giây sau khi connect
- Kiểm tra có comments mới trên Facebook không
- Xem Console log có lỗi không

### Rate Limit
**Giải pháp**:
- Đợi vài phút rồi thử lại
- Giảm số lần connect/disconnect

---

## 📚 Tài liệu tham khảo

- [Facebook Graph API - Live Videos](https://developers.facebook.com/docs/graph-api/reference/live-video/)
- [Facebook Graph API - Comments](https://developers.facebook.com/docs/graph-api/reference/v18.0/object/comments)
- [Access Tokens](https://developers.facebook.com/docs/facebook-login/access-tokens)

---

## 💡 Tips

1. **Test trước**: Test với 1 video live nhỏ trước khi dùng cho sự kiện
2. **Backup token**: Lưu token ở nơi an toàn
3. **Monitor**: Theo dõi Console log để debug
4. **Keywords**: Dùng keywords ngắn, dễ nhớ cho viewers

---

Chúc bạn sử dụng thành công! 🎉

