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
echo [1/3] Kiem tra Node.js...
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [X] Node.js chua duoc cai dat!
    echo.
    echo [^>] Dang tai va cai dat Node.js tu dong...
    echo.
    
    :: Tạo thư mục tạm để tải Node.js
    set "TEMP_DIR=%TEMP%\PCastPro_NodeJS"
    if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"
    
    :: Tải Node.js installer
    echo [^>] Dang tai Node.js LTS (v20.10.0)...
    echo [^>] Luu tai: %TEMP_DIR%\nodejs-installer.msi
    echo.
    
    powershell -ExecutionPolicy Bypass -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi' -OutFile '%TEMP_DIR%\nodejs-installer.msi'}"
    
    if exist "%TEMP_DIR%\nodejs-installer.msi" (
        echo [✓] Da tai Node.js thanh cong!
        echo.
        echo [^>] Dang cai dat Node.js...
        echo [!] Vui long lam theo huong dan trong cua so cai dat
        echo.
        
        :: Chạy installer với giao diện người dùng
        start /wait msiexec /i "%TEMP_DIR%\nodejs-installer.msi"
        
        :: Xóa file installer
        del "%TEMP_DIR%\nodejs-installer.msi"
        rmdir "%TEMP_DIR%"
        
        echo.
        echo [✓] Node.js da duoc cai dat!
        echo.
        echo [2/3] Kiem tra lai Node.js...
        node --version >nul 2>&1
        if %ERRORLEVEL% EQU 0 (
            for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
            echo [✓] Node.js hoat dong: %NODE_VERSION%
            
            echo.
            echo [3/3] Kiem tra npm...
            npm --version >nul 2>&1
            if %ERRORLEVEL% EQU 0 (
                for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
                echo [✓] npm hoat dong: %NPM_VERSION%
                echo.
                echo [✓] Cai dat thanh cong!
                echo [^>] Bay gio ban co the chay quick-start.bat de khoi dong PCastPro
            ) else (
                echo [X] npm khong hoat dong!
            )
        ) else (
            echo [X] Node.js khong hoat dong!
            echo [^>] Vui long khoi dong lai Command Prompt va thu lai
        )
    ) else (
        echo [X] Khong the tai Node.js!
        echo.
        echo [^>] Vui long cai dat Node.js thu cong:
        echo    1. Truy cap: https://nodejs.org/
        echo    2. Tai phien ban LTS (Long Term Support)
        echo    3. Cai dat voi cac tuy chon mac dinh
        echo    4. Khoi dong lai Command Prompt
        echo    5. Chay lai file nay
    )
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo [✓] Node.js da duoc cai dat: %NODE_VERSION%
    echo.
    echo [2/3] Kiem tra npm...
    npm --version >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
        echo [✓] npm da duoc cai dat: %NPM_VERSION%
        echo.
        echo [✓] Node.js va npm da san sang!
        echo [^>] Ban co the chay quick-start.bat de khoi dong PCastPro
    ) else (
        echo [X] npm khong hoat dong!
    )
)

echo.
echo ========================================
echo    Hoan thanh!
echo ========================================
echo.
pause
