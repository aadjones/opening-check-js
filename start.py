#!/usr/bin/env python3
"""
Development server starter script
Starts both backend and frontend servers with logging
"""

import os
import sys
import subprocess
import time
import signal
import threading
from pathlib import Path

# === NEW: Set project root as base directory ===
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR  # start.py is in the project root, so SCRIPT_DIR is PROJECT_ROOT
os.chdir(PROJECT_ROOT)
# === END NEW ===

# Colors for terminal output
class Colors:
    GREEN = '\033[92m'
    BLUE = '\033[94m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_colored(text, color):
    """Print colored text to terminal"""
    print(f"{color}{text}{Colors.END}")

def check_directories():
    """Check if we're in the right directory and dependencies are set up"""
    if not ((PROJECT_ROOT / "chess_backend").exists() and (PROJECT_ROOT / "chess_frontend").exists()):
        print_colored("ERROR: Please run this script from the project root directory", Colors.RED)
        print_colored("Expected to find: chess_backend/ and chess_frontend/", Colors.RED)
        sys.exit(1)
    
    # Check backend setup
    if not (PROJECT_ROOT / "chess_backend" / "env").exists():
        print_colored("ERROR: Backend virtual environment not found", Colors.RED)
        print_colored("Please run: cd chess_backend && make setup", Colors.YELLOW)
        sys.exit(1)
    
    # Check frontend setup
    if not (PROJECT_ROOT / "chess_frontend" / "node_modules").exists():
        print_colored("ERROR: Frontend node_modules not found", Colors.RED)
        print_colored("Please run: cd chess_frontend && npm install", Colors.YELLOW)
        sys.exit(1)

def run_with_logging(command, cwd, log_file):
    """Run a command and log output to file"""
    try:
        with open(PROJECT_ROOT / log_file, 'w', encoding='utf-8') as f:
            process = subprocess.Popen(
                command,
                cwd=PROJECT_ROOT / cwd,
                stdout=f,
                stderr=subprocess.STDOUT,
                shell=True,
                text=True
            )
        return process
    except Exception as e:
        print_colored(f"Error starting {log_file}: {e}", Colors.RED)
        return None

def tail_log(log_file, lines=3):
    """Get the last few lines from a log file"""
    try:
        log_path = PROJECT_ROOT / log_file
        if log_path.exists():
            with open(log_path, 'r', encoding='utf-8') as f:
                all_lines = f.readlines()
                return all_lines[-lines:] if len(all_lines) >= lines else all_lines
    except Exception:
        pass
    return []

def get_frontend_port():
    """Extract the actual port from frontend logs"""
    try:
        log_path = PROJECT_ROOT / "frontend.log"
        if log_path.exists():
            with open(log_path, 'r', encoding='utf-8') as f:
                content = f.read()
                # Look for "Local: http://localhost:XXXX"
                import re
                match = re.search(r'Local:\s+http://localhost:(\d+)', content)
                if match:
                    return match.group(1)
    except Exception:
        pass
    return "5173"  # default

def show_recent_logs():
    """Show recent log output from both servers"""
    print_colored("\n=== Recent Backend Output ===", Colors.BLUE)
    backend_lines = tail_log("backend.log", 3)
    for line in backend_lines:
        print(line.rstrip())
    
    print_colored("\n=== Recent Frontend Output ===", Colors.GREEN)
    frontend_lines = tail_log("frontend.log", 3)
    for line in frontend_lines:
        print(line.rstrip())
    print()

def cleanup_processes(processes):
    """Clean up background processes"""
    print_colored("\nShutting down servers...", Colors.YELLOW)
    for process in processes:
        if process and process.poll() is None:
            try:
                process.terminate()
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
    print_colored("Servers stopped.", Colors.GREEN)

def main():
    """Main function"""
    print_colored("Starting Out of Book development servers...", Colors.GREEN)
    
    # Check if we're in the right directory
    check_directories()
    
    processes = []
    
    # Set up signal handler for cleanup
    def signal_handler(sig, frame):
        cleanup_processes(processes)
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Start backend
    print_colored("Starting backend...", Colors.BLUE)
    # Use different commands based on OS
    if os.name == 'nt':  # Windows
        backend_command = "powershell -Command \"& env\\Scripts\\activate.ps1; uvicorn main:app --reload --port 8000\""
    else:  # Unix-like
        backend_command = ". env/bin/activate && uvicorn main:app --reload --port 8000"
    
    backend_process = run_with_logging(
        backend_command,
        "chess_backend",
        "backend.log"
    )
    if backend_process:
        processes.append(backend_process)
    
    # Start frontend
    print_colored("Starting frontend...", Colors.BLUE)
    frontend_process = run_with_logging(
        "npm run dev",
        "chess_frontend", 
        "frontend.log"
    )
    if frontend_process:
        processes.append(frontend_process)
    
    # Give servers a moment to start
    time.sleep(3)
    
    # Show startup info
    print()
    print_colored("🚀 Both servers started successfully!", Colors.GREEN)
    print()
    
    # Wait a moment and get the actual frontend port
    time.sleep(2)
    frontend_port = get_frontend_port()
    
    print_colored(f"Frontend: http://localhost:{frontend_port}", Colors.BLUE)
    print_colored("Backend:  http://localhost:8000", Colors.BLUE)
    print()
    print_colored("📝 Logs are being written to:", Colors.YELLOW)
    print("   Frontend: frontend.log")
    print("   Backend:  backend.log")
    print()
    print_colored("Press Ctrl+C to stop both servers", Colors.GREEN)
    print()
    
    # Monitor processes and show periodic log updates
    try:
        last_log_time = 0
        while True:
            # Check if processes are still running
            running_processes = [p for p in processes if p and p.poll() is None]
            
            if not running_processes:
                print_colored("All processes have stopped. Exiting...", Colors.YELLOW)
                break
            
            # Show recent logs every 15 seconds
            current_time = time.time()
            if current_time - last_log_time >= 15:
                show_recent_logs()
                last_log_time = current_time
            
            time.sleep(1)
            
    except KeyboardInterrupt:
        pass
    finally:
        cleanup_processes(processes)

if __name__ == "__main__":
    main() 