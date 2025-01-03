@echo off
cd "E:\GiaiDauLQM\LiveStream\Ver0.1\BanPickManagerAOV>" 
start cmd /k "node server.js"  
timeout /t 2 
start chrome "E:\GiaiDauLQM\LiveStream\Ver0.1\BanPickManagerAOV\banpickManager.html" 