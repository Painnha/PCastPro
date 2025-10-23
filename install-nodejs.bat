@echo off
chcp 65001 >nul
title PCastPro - Node.js Auto Installer
color 0C

echo.
echo ========================================
echo    PCastPro - Node.js Auto Installer
echo ========================================
echo.

:: Kiểm tra Node.js
echo [1/3] Kiểm tra Node.js...
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
    echo 🔽 Đang tải Node.js LTS (v20.10.0)...
    echo 📁 Lưu tại: %TEMP_DIR%\nodejs-installer.msi
    echo.
    
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi' -OutFile '%TEMP_DIR%\nodejs-installer.msi'}"
    
    if exist "%TEMP_DIR%\nodejs-installer.msi" (
        echo ✅ Đã tải Node.js thành công!
        echo.
        echo 🔧 Đang cài đặt Node.js...
        echo ⚠️  Vui lòng làm theo hướng dẫn trong cửa sổ cài đặt
        echo.
        
        :: Chạy installer với giao diện người dùng
        start /wait msiexec /i "%TEMP_DIR%\nodejs-installer.msi"
        
        :: Xóa file installer
        del "%TEMP_DIR%\nodejs-installer.msi"
        rmdir "%TEMP_DIR%"
        
        echo.
        echo ✅ Node.js đã được cài đặt!
        echo.
        echo [2/3] Kiểm tra lại Node.js...
        node --version >nul 2>&1
        if %errorlevel% equ 0 (
            for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
            echo ✅ Node.js hoạt động: %NODE_VERSION%
            
            echo.
            echo [3/3] Kiểm tra npm...
            npm --version >nul 2>&1
            if %errorlevel% equ 0 (
                for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
                echo ✅ npm hoạt động: %NPM_VERSION%
                echo.
                echo 🎉 Cài đặt thành công!
                echo 💡 Bây giờ bạn có thể chạy start-pcastpro.bat để khởi động PCastPro
            ) else (
                echo ❌ npm không hoạt động!
            )
        ) else (
            echo ❌ Node.js không hoạt động!
            echo 💡 Vui lòng khởi động lại Command Prompt và thử lại
        )
    ) else (
        echo ❌ Không thể tải Node.js!
        echo.
        echo 💡 Vui lòng cài đặt Node.js thủ công:
        echo    1. Truy cập: https://nodejs.org/
        echo    2. Tải phiên bản LTS (Long Term Support)
        echo    3. Cài đặt với các tùy chọn mặc định
        echo    4. Khởi động lại Command Prompt
        echo    5. Chạy lại file này
    )
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js đã được cài đặt: %NODE_VERSION%
    echo.
    echo [2/3] Kiểm tra npm...
    npm --version >nul 2>&1
    if %errorlevel% equ 0 (
        for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
        echo ✅ npm đã được cài đặt: %NPM_VERSION%
        echo.
        echo 🎉 Node.js và npm đã sẵn sàng!
        echo 💡 Bạn có thể chạy start-pcastpro.bat để khởi động PCastPro
    ) else (
        echo ❌ npm không hoạt động!
    )
)

echo.
echo ========================================
echo    Hoàn thành!
echo ========================================
echo.
pause
