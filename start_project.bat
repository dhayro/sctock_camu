@echo off
echo Iniciando el proyecto Stock Camu en segundo plano...

cd /d D:\sctock_camu

:: Detener instancias previas si existen (ajusta el nombre del proceso según sea necesario)
taskkill /F /IM node.exe /T 2>nul

:: Iniciar el proyecto en segundo plano
start /B cmd /c "npm start > npm-output.log 2>&1"

echo Proyecto iniciado en segundo plano.
echo Los logs se están guardando en npm-output.log
echo.
echo Para detener el servidor, cierra la ventana de comando o usa el Administrador de tareas.
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause > nul