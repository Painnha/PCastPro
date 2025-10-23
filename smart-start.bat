@echo off
chcp 65001 >nul
title PCastPro - Smart Auto Startup
color 0A

echo.
echo ========================================
echo    PCastPro - Smart Auto Startup
echo ========================================
echo.

:: Kiểm tra Node.js
echo [1/6] Kiểm tra Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js chưa được cài đặt!
    echo.
    echo 📥 Đang tải và cài đặt Node.js tự động...
    echo.
    
    :: Tạo thư mục tạm để tải Node.js
    set "TEMP_DIR=%TEMP%\PCastPro_NodeJS"
    if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"
    
    :: Tải Node.js installer
    echo 🔽 Đang tải Node.js LTS...
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi' -OutFile '%TEMP_DIR%\nodejs-installer.msi'}"
    
    if exist "%TEMP_DIR%\nodejs-installer.msi" (
        echo ✅ Đã tải Node.js thành công!
        echo.
        echo 🔧 Đang cài đặt Node.js...
        echo ⚠️  Vui lòng làm theo hướng dẫn trong cửa sổ cài đặt
        echo.
        
        :: Chạy installer
        start /wait msiexec /i "%TEMP_DIR%\nodejs-installer.msi" /quiet /norestart
        
        :: Xóa file installer
        del "%TEMP_DIR%\nodejs-installer.msi"
        rmdir "%TEMP_DIR%"
        
        echo.
        echo ✅ Node.js đã được cài đặt!
        echo 🔄 Đang khởi động lại script...
        echo.
        
        :: Khởi động lại script sau khi cài đặt
        timeout /t 3 /nobreak >nul
        start "" "%~f0"
        exit /b 0
    ) else (
        echo ❌ Không thể tải Node.js!
        echo.
        echo 💡 Vui lòng cài đặt Node.js thủ công:
        echo    1. Truy cập: https://nodejs.org/
        echo    2. Tải phiên bản LTS (Long Term Support)
        echo    3. Cài đặt với các tùy chọn mặc định
        echo    4. Khởi động lại Command Prompt
        echo    5. Chạy lại file này
        echo.
        pause
        exit /b 1
    )
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js đã được cài đặt: %NODE_VERSION%
)

:: Kiểm tra npm
echo.
echo [2/6] Kiểm tra npm...
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
echo [3/6] Chuyển đến thư mục backend...
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
echo [4/6] Cài đặt dependencies...
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

:: Kiểm tra port 3000
echo.
echo [5/6] Kiểm tra port 3000...
netstat -an | find "3000" >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Port 3000 đang được sử dụng!
    echo 💡 Đang thử dừng các process đang sử dụng port 3000...
    
    :: Tìm và dừng process sử dụng port 3000
    for /f "tokens=5" %%a in ('netstat -ano ^| find "3000"') do (
        taskkill /PID %%a /F >nul 2>&1
    )
    
    timeout /t 2 /nobreak >nul
    echo ✅ Đã dọn dẹp port 3000
) else (
    echo ✅ Port 3000 sẵn sàng
)

:: Khởi động server và mở trình duyệt
echo.
echo [6/6] Khởi động PCastPro...
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
