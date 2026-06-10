@echo off
cd /d "C:\Users\egg8833\Desktop\每日周報"

if exist ".git\index.lock" del /f ".git\index.lock"
if exist ".git\HEAD.lock"  del /f ".git\HEAD.lock"

copy /y "new_skill_content.md" "C:\Users\egg8833\Claude\Scheduled\daily-briefing-tw\SKILL.md"

git add INSTRUCTIONS.md update_report.py new_skill_content.md update_sections_push.bat
git commit -m "feat: expand report to 9 sections (career + motivation)"
git push

echo [DONE]
pause
