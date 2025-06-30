# Cross-platform Makefile for Chess Backend
# Automatically detects Windows vs Unix and uses appropriate commands

# Force bash as the shell
SHELL := /bin/bash
.SHELLFLAGS := -c

.PHONY: start dev install setup test clean format lint type-check check-all help gen-pytypes kill

# Detect operating system
ifeq ($(OS),Windows_NT)
    # Windows detected
    SHELL := powershell.exe
    .SHELLFLAGS := -NoProfile -Command
    PYTHON := python
    VENV_ACTIVATE := & env\Scripts\activate.ps1
    ECHO := Write-Host
    RM_DIR := if (Test-Path $$1) { Remove-Item -Recurse -Force $$1 }
else
    # Unix-like system (Mac/Linux)
    PYTHON := python
    VENV_ACTIVATE := . env/bin/activate
    ECHO := echo
    RM_DIR := rm -rf $$1
endif

# Chess Backend
BACKEND_PORT ?= 8000          # change if you don't use 8000
NGROK_BIN    ?= ngrok         # or full path if it isn't on PATH
PROJECT_REF  ?= fsmtmtconngujlhmkqgp   # your project id

# Mode: dev (default) or prod
MODE ?= dev
# Production backend URL
PROD_BACKEND_URL ?= https://opening-check-js-production.up.railway.app

# Help
help:
ifeq ($(OS),Windows_NT)
	$(ECHO) ""
	$(ECHO) "Available commands:"
	$(ECHO) "  make setup      - Create virtual environment and install dependencies"
	$(ECHO) "  make start      - Start the development server (MODE=dev updates BACKEND_URL secret to ngrok, MODE=prod sets BACKEND_URL to production URL)"
	$(ECHO) "  make dev        - Start server with external access"
	$(ECHO) "  make install    - Install dependencies only"
	$(ECHO) "  make test       - Run tests"
	$(ECHO) "  make format     - Format code with black and isort"
	$(ECHO) "  make lint       - Lint code with flake8"
	$(ECHO) "  make type-check - Type check with mypy"
	$(ECHO) "  make check-all  - Run all checks"
	$(ECHO) "  make clean      - Clean up virtual environment and cache"
	$(ECHO) "  make gen-pytypes - Generate Pydantic models from Supabase types"
	$(ECHO) "  make kill       - Kill processes running on port 8000"
	$(ECHO) ""
else
	@echo ""
	@echo "Available commands:"
	@echo "  make setup      - Create virtual environment and install dependencies"
	@echo "  make start      - Start the development server (MODE=dev updates BACKEND_URL secret to ngrok, MODE=prod sets BACKEND_URL to production URL)"
	@echo "  make dev        - Start server with external access"
	@echo "  make install    - Install dependencies only"
	@echo "  make test       - Run tests"
	@echo "  make format     - Format code with black and isort"
	@echo "  make lint       - Lint code with flake8"
	@echo "  make type-check - Type check with mypy"
	@echo "  make check-all  - Run all checks"
	@echo "  make clean      - Clean up virtual environment and cache"
	@echo "  make gen-pytypes - Generate Pydantic models from Supabase types"
	@echo "  make kill       - Kill processes running on port 8000"
	@echo ""
endif

# Setup virtual environment and install dependencies
setup:
ifeq ($(OS),Windows_NT)
	$(ECHO) "Setting up virtual environment for Windows..."
	$(PYTHON) -m venv env
	$(ECHO) "Installing dependencies..."
	$(VENV_ACTIVATE); pip install -r requirements.txt
	$(VENV_ACTIVATE); pip install -e .
	$(ECHO) "Setup complete! Run 'make start' to start the server."
else
	@echo "Setting up virtual environment for Unix..."
	@rm -rf env
	@$(PYTHON) -m venv env
	@echo "Installing dependencies..."
	@env/bin/pip install --upgrade pip
	@env/bin/pip install -r requirements.txt
	@env/bin/pip install -e .
	@echo "Setup complete! Run 'make start' to start the server."
endif

# ------------------------------------------------------------------
# Start FastAPI + ngrok, push new URL to Supabase, redeploy function
# ------------------------------------------------------------------
start:
ifeq ($(OS),Windows_NT)
	$(ECHO) "▶︎ This auto‑update flow is Bash‑only for now.\
Use the PowerShell block above or run WSL."
else
	@if [ "$(MODE)" = "prod" ]; then \
		echo "[PROD] Setting BACKEND_URL secret to $(PROD_BACKEND_URL)"; \
		supabase secrets set BACKEND_URL=$(PROD_BACKEND_URL); \
		echo "[PROD] Redeploying edge functions..."; \
		cd $(dir $(lastword $(MAKEFILE_LIST)))/..; \
		for fn in $(shell ls supabase/functions); do \
		  if [ -d "supabase/functions/$$fn" ] && [ "$$fn" != "_shared" ]; then \
		    supabase functions deploy $$fn; \
		  fi; \
		done; \
		echo "✅  Edge functions deployed successfully!"; \
		echo "   • sign-jwt: Ready to authenticate users"; \
		echo "   • analyze-games: Ready to process game analysis"; \
		echo "   • BACKEND_URL: $(PROD_BACKEND_URL)"; \
	else \
		chmod +x start.sh; \
		$(VENV_ACTIVATE) && ./start.sh; \
	fi
endif

# Start with external access
dev:
ifeq ($(OS),Windows_NT)
	$(ECHO) "Starting Chess Backend Server with external access..."
	$(VENV_ACTIVATE); uvicorn main:app --reload --host 0.0.0.0 --port 8000
else
	@echo "Starting Chess Backend Server with external access..."
	@$(VENV_ACTIVATE) && uvicorn main:app --reload --host 0.0.0.0 --port 8000
endif

# Install dependencies only
install:
ifeq ($(OS),Windows_NT)
	$(ECHO) "Installing dependencies..."
	$(VENV_ACTIVATE); pip install -r requirements.txt
	$(VENV_ACTIVATE); pip install -e .
else
	@echo "Installing dependencies..."
	@$(VENV_ACTIVATE) && pip install -r requirements.txt
	@$(VENV_ACTIVATE) && pip install -e .
endif

# Run tests
test:
ifeq ($(OS),Windows_NT)
	$(VENV_ACTIVATE); pytest
else
	@$(VENV_ACTIVATE) && pytest
endif

# Format code
format:
ifeq ($(OS),Windows_NT)
	$(ECHO) "Formatting code with black..."
	$(VENV_ACTIVATE); black .
	$(ECHO) "Sorting imports with isort..."
	$(VENV_ACTIVATE); isort .
else
	@echo "Formatting code with black..."
	@$(VENV_ACTIVATE) && black .
	@echo "Sorting imports with isort..."
	@$(VENV_ACTIVATE) && isort .
endif

# Lint code
lint:
ifeq ($(OS),Windows_NT)
	$(ECHO) "Linting code with flake8..."
	$(VENV_ACTIVATE); flake8 .
else
	@echo "Linting code with flake8..."
	@$(VENV_ACTIVATE) && flake8 .
endif

# Type check
type-check:
ifeq ($(OS),Windows_NT)
	$(ECHO) "Type checking with mypy..."
	$(VENV_ACTIVATE); mypy *.py tests/*.py
else
	@echo "Type checking with mypy..."
	@$(VENV_ACTIVATE) && mypy *.py tests/*.py
endif

# Run all checks
check-all: format lint type-check test
ifeq ($(OS),Windows_NT)
	$(ECHO) "All checks completed!"
else
	@echo "All checks completed!"
endif

# Clean up
clean:
ifeq ($(OS),Windows_NT)
	$(ECHO) "Cleaning up..."
	$(call RM_DIR,env)
	$(call RM_DIR,__pycache__)
	$(call RM_DIR,.pytest_cache)
	$(call RM_DIR,chess_backend.egg-info)
	$(ECHO) "Cleanup complete!"
else
	@echo "Cleaning up..."
	@$(call RM_DIR,env/)
	@$(call RM_DIR,__pycache__/)
	@$(call RM_DIR,.pytest_cache/)
	@$(call RM_DIR,chess_backend.egg-info/)
	@echo "Cleanup complete!"
endif

# Generate Pydantic models from Supabase types
gen-pytypes:
	@echo "Generating Pydantic models from Supabase types..."
	python3 scripts/gen_pydantic_from_supabase.py 

# Kill processes running on port 8000
kill:
ifeq ($(OS),Windows_NT)
	$(ECHO) "Killing processes on port 8000..."
	netstat -ano | findstr :8000 | for /f "tokens=5" %a in ('more') do taskkill /f /pid %a 2>nul || echo No processes found
else
	@echo "Killing processes on port 8000..."
	@lsof -ti :8000 | xargs kill -9 2>/dev/null || echo "No processes found on port 8000"
endif