@echo off
chcp 65001 >nul
title PCastPro - Quick Start
color 0B

echo.
echo ========================================
echo    PCastPro - Quick Start
echo ========================================
echo.

:: Cập nhật từ GitHub
echo [1/4] Cập nhật mã nguồn từ GitHub...
cd /d "%~dp0"
if exist ".git" (
    git fetch origin >nul 2>&1
    if errorlevel 1 (
        echo ⚠️  Không thể kết nối với GitHub, tiếp tục với mã hiện tại...
    ) else (
        for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set CURRENT_BRANCH=%%i
        echo 📥 Đang tải cập nhật mới nhất...
        git pull origin %CURRENT_BRANCH%
        if errorlevel 1 (
            echo ⚠️  Không thể cập nhật (có thể có file được sửa đổi)
        ) else (
            echo ✅ Đã cập nhật mã nguồn thành công!
        )
    )
) else (
    echo ℹ️  Không phải Git repository, bỏ qua cập nhật
)
echo.

:: Chuyển đến thư mục backend
echo [2/4] Chuyển đến thư mục backend...
cd /d "%~dp0backend"

:: Kiểm tra node_modules
echo [3/4] Kiểm tra dependencies...
if not exist "node_modules" (
    echo 📦 Cài đặt dependencies lần đầu...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Lỗi khi cài đặt dependencies!
        pause
        exit /b 1
    )
    echo ✅ Đã cài đặt dependencies!
)
echo.

:: Mở trình duyệt và khởi động
echo [4/4] Khởi động PCastPro...
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"
echo 🌐 Đã mở trình duyệt!
echo 🚀 Đang khởi động backend server...
echo.
echo ⚠️  Không đóng cửa sổ này để giữ server chạy
echo 💡 Để dừng: Nhấn Ctrl+C
echo.

:: Khởi động server
npm run dev
