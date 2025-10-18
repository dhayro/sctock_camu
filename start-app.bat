@echo off
REM Inicia backend
start cmd /k "cd /d %~dp0stock_camu_backend && npm run dev"
REM Inicia frontend
start cmd /k "cd /d %~dp0sctock_camu && npm start"