@echo off
chcp 65001 >nul
title 考研题库网站 - 局域网平板访问服务

echo ========================================================
echo          🎓 考研题库网站 - 局域网平板访问服务
echo ========================================================
echo.

:: 获取本机 IPv4 地址
set "IP="
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "127.0.0.1"') do (
    set "IP=%%a"
    goto :found_ip
)

:found_ip
set IP=%IP:~1%

echo [1] 确认你的平板和电脑连接了【同一个 WiFi】
echo [2] 在平板的浏览器 (Safari / Chrome) 中输入以下网址：
echo.
echo      👉 http://%IP%:8000
echo.
echo ========================================================
echo   服务运行中...（刷题期间请勿关闭此窗口）
echo ========================================================
echo.

cd /d "D:\考研题库网站"
python -m http.server 8000

pause
