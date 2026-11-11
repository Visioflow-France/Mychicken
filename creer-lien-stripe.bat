@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================
echo   CREER UN COMPTE STRIPE CONNECT + LE LIEN
echo ============================================
echo.
set /p NOM=Nom du restaurant (ex: My Chicken) : 
echo.
call node scripts/stripe-connect-link.mjs "%NOM%"
echo.
pause
