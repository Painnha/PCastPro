@echo off
chcp 65001 >nul
title PCastPro - Auto Startup
color 0A

echo.
echo ========================================
echo    PCastPro - Auto Startup Script
echo ========================================
echo.

:: Kiểm tra Node.js
echo [1/5] Kiểm tra Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js chưa được cài đặt!
    echo.
    echo 📥 Đang tải Node.js...
    echo Vui lòng cài đặt Node.js từ: https://nodejs.org/
    echo Sau khi cài đặt xong, chạy lại file này.
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js đã được cài đặt: %NODE_VERSION%
)

:: Kiểm tra npm
echo.
echo [2/5] Kiểm tra npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm chưa được cài đặt!
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm đã được cài đặt: %NPM_VERSION%
)

:: Chuyển đến thư mục backend
echo.
echo [3/5] Chuyển đến thư mục backend...
cd /d "%~dp0backend"
if not exist "package.json" (
    echo ❌ Không tìm thấy package.json trong thư mục backend!
    echo Vui lòng đảm bảo file này được đặt trong thư mục gốc của project.
    pause
    exit /b 1
)
echo ✅ Đã chuyển đến thư mục backend

:: Cài đặt dependencies
echo.
echo [4/5] Cài đặt dependencies...
echo 📦 Đang cài đặt các package cần thiết...
echo (Quá trình này có thể mất vài phút lần đầu tiên)
echo.

npm install
if %errorlevel% neq 0 (
    echo ❌ Lỗi khi cài đặt dependencies!
    echo Vui lòng kiểm tra kết nối internet và thử lại.
    pause
    exit /b 1
)
echo ✅ Đã cài đặt dependencies thành công!

:: Khởi động server và mở trình duyệt
echo.
echo [5/5] Khởi động PCastPro...
echo 🚀 Đang khởi động backend server...
echo 🌐 Sẽ tự động mở trình duyệt sau 3 giây...
echo.

:: Đếm ngược và mở trình duyệt
timeout /t 3 /nobreak >nul
start "" "http://localhost:3000"

echo ✅ Đã mở trình duyệt!
echo.
echo ========================================
echo    PCastPro đã sẵn sàng!
echo ========================================
echo.
echo 📝 Hướng dẫn sử dụng:
echo    1. Đăng nhập với tài khoản của bạn
echo    2. Sử dụng các chức năng banpick và fandom war
echo    3. Các URL OBS sẽ tự động cập nhật
echo.
echo ⚠️  Lưu ý: Không đóng cửa sổ này để giữ server chạy
echo 💡 Để dừng server: Nhấn Ctrl+C
echo.

:: Khởi động server
npm run dev

:: Nếu server dừng, hiển thị thông báo
echo.
echo ========================================
echo    Server đã dừng
echo ========================================
echo.
echo Nhấn phím bất kỳ để đóng...
pause >nul