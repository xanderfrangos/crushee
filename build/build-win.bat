cd ..
cd crushee-server
git pull
cd ..
electron-packager . crushee-desktop --overwrite --platform=win32 --arch=x64 --prune=true --out=releases --icon=assets/icon.ico --ignore "./build/" --ignore ".git" --win32metadata.ProductName="Crushee" --win32metadata.CompanyName="Xander Frangos" --win32metadata.FileDescription="An image squisher" --win32metadata.InternalName="crushee-desktop"
pause