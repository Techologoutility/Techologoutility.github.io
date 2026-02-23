@echo off
cd /d "%~dp0"
py clock.py 2>nul || python clock.py
pause
