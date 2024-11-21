magick pc_Launcher_1024x1024_R.png -resize 32x32 icon-32.png
magick pc_Launcher_1024x1024_R.png -resize 48x48 icon-48.png
magick pc_Launcher_1024x1024_R.png -resize 96x96 icon-96.png
magick pc_Launcher_1024x1024_R.png -resize 256x256 icon-256.png
magick pc_Launcher_1024x1024_R.png -resize 512x512 icon-512.png
magick icon-32.png icon-48.png icon-96.png icon-256.png icon-512.png app.ico
mkdir AppIcon.iconset
mv icon-32.png AppIcon.iconset/icon_16x16.png
magick pc_Launcher_1024x1024_R.png -resize 16x16 AppIcon.iconset/icon_16x16@2x.png
mv icon-48.png AppIcon.iconset/icon_32x32.png
magick pc_Launcher_1024x1024_R.png -resize 64x64 AppIcon.iconset/icon_32x32@2x.png
mv icon-96.png AppIcon.iconset/icon_128x128.png
magick pc_Launcher_1024x1024_R.png -resize 256x256 AppIcon.iconset/icon_128x128@2x.png
mv icon-256.png AppIcon.iconset/icon_256x256.png
magick pc_Launcher_1024x1024_R.png -resize 512x512 AppIcon.iconset/icon_256x256@2x.png
mv icon-512.png AppIcon.iconset/icon_512x512.png
cp pc_Launcher_1024x1024_R.png AppIcon.iconset/icon_512x512@2x.png
iconutil -c icns AppIcon.iconset
rm -rf pc_Launcher_1024x1024_R.png AppIcon.iconset
