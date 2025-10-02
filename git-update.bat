@echo off
cd /d %~dp0

echo 🔄 Adding changes...
git add .

echo 💾 Committing...
git commit -m "Auto update %date% %time%"

echo 📤 Pushing to GitHub...
git push origin main

echo ✅ Done!
pause
