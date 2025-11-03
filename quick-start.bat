@echo off
chcp 65001 >nul
title PCastPro - Quick Start
color 0B

echo.
echo ========================================
echo    PCastPro - Quick Start
echo ========================================
echo.

:: Cập nhật từ GitHub (Force Update - đè lên mã cũ)
echo [1/4] Cap nhat ma nguon tu GitHub...
cd /d "%~dp0"
if exist ".git" (
    echo Dang kiem tra cap nhat...
    git fetch origin
    if %ERRORLEVEL% EQU 0 (
        for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set CURRENT_BRANCH=%%i
        echo Dang cap nhat tu branch %CURRENT_BRANCH%...
        echo Huy tat ca thay doi local va dong bo 100%% voi GitHub...
        git reset --hard origin/%CURRENT_BRANCH%
        if %ERRORLEVEL% EQU 0 (
            echo [✓] Da cap nhat ma nguon thanh cong!
            echo [✓] Ma nguon hien tai giong 100%% voi GitHub
        ) else (
            echo [!] Khong the cap nhat
        )
    ) else (
        echo [!] Khong the ket noi voi GitHub
        echo Tiep tuc voi ma nguon hien tai...
    )
) else (
    echo [!] Khong phai Git repository, bo qua cap nhat
)
echo.

:: Chuyển đến thư mục backend
echo [2/4] Chuyen den thu muc backend...
cd /d "%~dp0backend"

:: Kiểm tra node_modules
echo [3/4] Kiem tra dependencies...
if not exist "node_modules" (
    echo Cai dat dependencies lan dau...
    npm install
    if errorlevel 1 (
        echo Loi khi cai dat dependencies!
        pause
        exit /b 1
    )
    echo Da cai dat dependencies!
)
echo.

:: Mở trình duyệt và khởi động
echo [4/4] Khoi dong PCastPro...
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"
echo Da mo trinh duyet!
echo Dang khoi dong backend server...
echo.
echo Khong dong cua so nay de giu server chay
echo De dung: Nhan Ctrl+C
echo.

:: Khởi động server
npm run dev
