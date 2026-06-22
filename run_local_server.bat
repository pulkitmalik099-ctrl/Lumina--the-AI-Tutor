@echo off
title Lumina Local Server for Mobile Devices
color 0b

echo ===================================================
echo   Lumina: Local Mobile Server Bootstrapper
echo ===================================================
echo.
echo Make sure your Phone and PC are connected to the SAME Wi-Fi network!
echo.

:: Detect Local IP Address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| find "IPv4 Address"') do (
    set ip=%%a
)
:: Strip spaces
set ip=%ip: =%

if "%ip%"=="" (
    echo [!] Could not detect local IPv4 address. Please check your network connection.
    set ip=localhost
)

echo PC Local IP Address: %ip%
echo.

:: Detect Node.js
where node >nul 2>nul
if %errorlevel%==0 (
    echo [Status] Node.js detected. Starting server using http-server...
    echo.
    echo ---------------------------------------------------
    echo 👉 On your Android or iPhone, open: http://%ip%:8080
    echo ---------------------------------------------------
    echo.
    npx -y http-server -p 8080 .
    goto :end
)

:: Detect Python as fallback
where python >nul 2>nul
if %errorlevel%==0 (
    echo [Status] Python detected. Starting server using http.server...
    echo.
    echo ---------------------------------------------------
    echo 👉 On your Android or iPhone, open: http://%ip%:8080
    echo ---------------------------------------------------
    echo.
    python -m http.server 8080
    goto :end
)

echo [!] Error: Neither Node.js nor Python is installed on your PC.
echo Please install Node.js from https://nodejs.org/ to run this server.
pause

:end
