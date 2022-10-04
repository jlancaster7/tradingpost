del node_modules
npm cache clean --force
npm install
watchman watch-del-all
del %localappdata%\Temp\haste-map-*
del %localappdata%\Temp\metro-cache
npx expo start --clear