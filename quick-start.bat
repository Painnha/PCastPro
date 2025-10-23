@echo off
chcp 65001 >nul
title PCastPro - Quick Start
color 0B

echo.
echo ========================================
echo    PCastPro - Quick Start
echo ========================================
echo.

:: Chuyển đến thư mục backend
cd /d "%~dp0backend"

:: Kiểm tra node_modules
if not exist "node_modules" (
    echo 📦 Cài đặt dependencies lần đầu...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Lỗi khi cài đặt dependencies!
        pause
        exit /b 1
    )
)

:: Mở trình duyệt sau 2 giây
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"

echo 🚀 Khởi động PCastPro...
echo 🌐 Đã mở trình duyệt!
echo.
echo ⚠️  Không đóng cửa sổ này để giữ server chạy
echo 💡 Để dừng: Nhấn Ctrl+C
echo.

:: Khởi động server
npm run dev
