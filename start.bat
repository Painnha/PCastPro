@echo off
cd "E:\GiaiDauLQM\LiveStream>" 
start cmd /k "node server.js"  
timeout /t 2 
start chrome "E:\GiaiDauLQM\LiveStream\banpickManger.html" 