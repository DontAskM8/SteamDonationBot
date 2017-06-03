@ECHO OFF
node login.js
IF %ERRORLEVEL% == 0 GOTO QUIT
pause
:QUIT