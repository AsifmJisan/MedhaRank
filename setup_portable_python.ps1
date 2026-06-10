Write-Host "Downloading Python embedded package..."
Invoke-WebRequest -Uri "https://www.python.org/ftp/python/3.12.3/python-3.12.3-embed-amd64.zip" -OutFile "python-embed.zip"
Write-Host "Extracting Python embedded package..."
Expand-Archive -Path "python-embed.zip" -DestinationPath "python_runtime" -Force
Write-Host "Modifying python312._pth to enable site-packages..."
$pthPath = "python_runtime\python312._pth"
(Get-Content $pthPath) -replace '#import site', 'import site' | Set-Content $pthPath
Write-Host "Downloading get-pip.py..."
Invoke-WebRequest -Uri "https://bootstrap.pypa.io/get-pip.py" -OutFile "get-pip.py"
Write-Host "Installing pip..."
.\python_runtime\python.exe get-pip.py
Write-Host "Installing project requirements..."
.\python_runtime\python.exe -m pip install -r requirements.txt
Write-Host "Cleaning up setup files..."
Remove-Item -Force "python-embed.zip"
Remove-Item -Force "get-pip.py"
Write-Host "Portable Python setup complete!"
