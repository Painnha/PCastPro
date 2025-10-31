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
echo [1/4] Cap nhat ma nguon tu GitHub...
cd /d "%~dp0"
if exist ".git" (
    git fetch origin >nul 2>&1
    if not errorlevel 1 (
        for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set CURRENT_BRANCH=%%i
        echo Dang tai cap nhat moi nhat...
        git pull origin %CURRENT_BRANCH%
        if not errorlevel 1 (
            echo Da cap nhat ma nguon thanh cong!
        ) else (
            echo Khong the cap nhat (co the co file duoc sua doi)
        )
    ) else (
        echo Khong the ket noi voi GitHub, tiep tuc voi ma hien tai...
    )
) else (
    echo Khong phai Git repository, bo qua cap nhat
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
