@echo off
chcp 65001 >nul
echo ====================================
echo  禾伴健康 - 小程序开发启动脚本
echo ====================================
echo.

cd /d "%~dp0apps\mini"

echo [1/3] 检查依赖...
if not exist "node_modules" (
    echo 首次运行，正在安装依赖...
    call pnpm install
)

echo.
echo [2/3] 清理旧的编译文件...
if exist "dist\dev\mp-weixin" (
    rmdir /s /q "dist\dev\mp-weixin" 2>nul
)

echo.
echo [3/3] 启动开发服务器...
echo.
echo ====================================
echo  编译服务已启动！
echo ====================================
echo.
echo  ✅ 请保持此窗口打开
echo  ✅ 微信开发者工具会自动更新
echo  ✅ 项目路径: apps\mini\dist\dev\mp-weixin
echo.
echo  按 Ctrl+C 停止服务
echo ====================================
echo.

call pnpm run dev:mp-weixin
