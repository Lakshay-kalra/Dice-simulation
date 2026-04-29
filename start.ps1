# Set execution policy scope for current process to bypass if needed
Write-Host "🎲 Starting Dice Simulator..." -ForegroundColor Magenta

# Start Backend in a new window
Write-Host "Starting Backend API (Port 5005)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# Start Frontend in a new window
Write-Host "Starting Frontend React App..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "🚀 Both servers are launching in separate windows." -ForegroundColor Yellow
Write-Host "Please ensure MongoDB is running if needed!" -ForegroundColor Gray
