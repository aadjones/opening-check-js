# Out Of Book - Chess Analysis App
# Root Makefile for starting both backend and frontend servers

.PHONY: start dev setup clean help test check-python

# Auto-detect the correct Python command
# Priority: python3 > python (if it's Python 3.x) > error
PYTHON := $(shell \
	if command -v python3 >/dev/null 2>&1; then \
		echo "python3"; \
	elif command -v python >/dev/null 2>&1; then \
		if python --version 2>&1 | grep -q "Python 3"; then \
			echo "python"; \
		else \
			echo ""; \
		fi; \
	else \
		echo ""; \
	fi)

# Default target - shows help
help:
	@echo "🏆 Out Of Book - Chess Analysis App"
	@echo ""
	@echo "Available commands:"
	@echo "  make setup       - Install all dependencies (backend + frontend)"
	@echo "  make start       - Start both servers (simple mode)"
	@echo "  make dev         - Start both servers (full mode with ngrok)"
	@echo "  make test        - Run all tests"
	@echo "  make clean       - Clean all build artifacts"
	@echo "  make check-python - Check Python setup"
	@echo ""
	@echo "Quick start: make setup && make start"

# Check Python installation
check-python:
	@echo "🐍 Checking Python installation..."
	@if [ "$(PYTHON)" = "" ]; then \
		echo "❌ Error: No compatible Python found!"; \
		echo "   Please install Python 3.7+ and ensure it's available as:"; \
		echo "   - 'python3' (recommended)"; \
		echo "   - 'python' (if it points to Python 3.x)"; \
		exit 1; \
	else \
		echo "✅ Found Python: $(PYTHON)"; \
		$(PYTHON) --version; \
	fi

# Start both servers in simple mode
start: check-python
	@echo "🚀 Starting both servers (simple mode)..."
	$(PYTHON) scripts/start.py

# Start both servers with full backend features (ngrok, etc.)
dev: check-python
	@echo "🚀 Starting both servers (full mode with ngrok)..."
	$(PYTHON) scripts/start.py --backend-mode full

# Setup everything from scratch
setup: check-python
	@echo "🔧 Setting up Out Of Book development environment..."
	@echo ""
	@echo "📦 Setting up backend dependencies..."
	cd chess_backend && make setup
	@echo ""
	@echo "📦 Setting up frontend dependencies..."
	cd chess_frontend && npm install
	@echo ""
	@echo "✅ Setup complete! Run 'make start' to begin development."

# Run tests for both projects
test: check-python
	@echo "🧪 Running all tests..."
	@echo ""
	@echo "🧪 Backend tests..."
	cd chess_backend && make test
	@echo ""
	@echo "🧪 Frontend tests..."
	cd chess_frontend && npm run test:run

# Clean build artifacts
clean:
	@echo "🧹 Cleaning all build artifacts..."
	@echo "🧹 Cleaning backend..."
	cd chess_backend && make clean
	@echo "🧹 Cleaning frontend..."
	cd chess_frontend && rm -rf dist/ node_modules/.vite/ || true
	@echo "🧹 Cleaning logs..."
	rm -f logs/*.log || true
	@echo "✅ Cleanup complete!"

# Quick status check
status:
	@echo "📊 Project Status:"
	@echo ""
	@echo "Backend environment:"
	@if [ -d "chess_backend/env" ]; then \
		echo "  ✅ Virtual environment exists"; \
	else \
		echo "  ❌ Virtual environment missing (run 'make setup')"; \
	fi
	@echo ""
	@echo "Frontend dependencies:"
	@if [ -d "chess_frontend/node_modules" ]; then \
		echo "  ✅ Node modules installed"; \
	else \
		echo "  ❌ Node modules missing (run 'make setup')"; \
	fi
	@echo ""
	@$(MAKE) check-python