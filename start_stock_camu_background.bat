@echo off
echo Iniciando Stock Camu en segundo plano...

:: Cambiar al directorio del proyecto
cd /d D:\sctock_camu

:: Detener instancias previas si existen
taskkill /F /IM node.exe /T 2>nul

:: Iniciar la aplicación en segundo plano usando VBScript
start /b "" wscript.exe run_stock_camu_hidden.vbs

echo Stock Camu se ha iniciado en segundo plano.
echo Los logs se están guardando en npm-output.log
echo.
echo Para detener la aplicación, usa el Administrador de tareas para cerrar los procesos de Node.js.
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause > nul