@echo off
echo Configurando el servicio Stock Camu...

:: Ruta completa a nssm.exe (ajusta según donde lo hayas colocado)
set NSSM_PATH=C:\Windows\System32\nssm.exe

:: Configurar el servicio
%NSSM_PATH% install StockCamuService "C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" start
%NSSM_PATH% set StockCamuService AppDirectory "D:\sctock_camu"
%NSSM_PATH% set StockCamuService DisplayName "Stock Camu Service"
%NSSM_PATH% set StockCamuService Description "Servicio para ejecutar la aplicación Stock Camu"
%NSSM_PATH% set StockCamuService Start SERVICE_AUTO_START

echo Servicio configurado. Puedes iniciarlo desde el Administrador de servicios de Windows.
pause