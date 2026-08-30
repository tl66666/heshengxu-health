@echo off
chcp 65001 >nul
echo ====================================
echo  禾伴健康 - 开发服务器启动
echo ====================================
echo.

cd /d D:\禾伴\heban-ai-health-demo\apps\mini

echo 正在启动开发服务器...
echo.
echo 请保持此窗口打开！
echo 微信开发者工具会自动刷新
echo.
echo 按 Ctrl+C 停止服务
echo ====================================
echo.

pnpm run dev:mp-weixin
