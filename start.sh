#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Out of Book development servers...${NC}"

# Function to cleanup background processes on exit
cleanup() {
    echo -e "\n${GREEN}Shutting down servers...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit
}

# Set up trap to cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

# Start backend
echo -e "${BLUE}Starting backend...${NC}"
(cd chess_backend && make start > ../backend.log 2>&1) &
BACKEND_PID=$!

# Start frontend  
echo -e "${BLUE}Starting frontend...${NC}"
(cd chess_frontend && npm run dev > ../frontend.log 2>&1) &
FRONTEND_PID=$!

# Give servers a moment to start
sleep 2

echo ""
echo -e "${GREEN}🚀 Both servers started successfully!${NC}"
echo ""
echo -e "${BLUE}Frontend:${NC} http://localhost:5173"
echo -e "${BLUE}Backend:${NC}  http://localhost:8000"
echo ""
echo -e "📝 Logs are being written to:"
echo -e "   Frontend: frontend.log"
echo -e "   Backend:  backend.log"
echo ""
echo -e "${GREEN}Press Ctrl+C to stop both servers${NC}"
echo ""

# Keep the script running
while true; do
    sleep 1
done 