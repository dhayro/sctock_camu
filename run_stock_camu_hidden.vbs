
Set objShell = CreateObject("WScript.Shell")
objShell.CurrentDirectory = "D:\sctock_camu"
objShell.Run "cmd /c npm start > npm-output.log 2>&1", 0, False
