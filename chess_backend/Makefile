.PHONY: start dev install setup test clean format lint type-check check-all

# Start the development server
start:
	@echo "Starting Chess Backend Server..."
	@if [ ! -d "env" ]; then \
		echo "Virtual environment not found. Run 'make setup' first."; \
		exit 1; \
	fi
	@source env/bin/activate && uvicorn main:app --reload

# Start with external access
dev:
	@echo "Starting Chess Backend Server (external access)..."
	@if [ ! -d "env" ]; then \
		echo "Virtual environment not found. Run 'make setup' first."; \
		exit 1; \
	fi
	@source env/bin/activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Install dependencies only
install:
	@echo "Installing dependencies..."
	@source env/bin/activate && pip install -r requirements.txt
	@source env/bin/activate && pip install -e .

# Full setup: create venv and install dependencies
setup:
	@echo "Setting up virtual environment..."
	@python3 -m venv env
	@echo "Installing dependencies..."
	@source env/bin/activate && pip install -r requirements.txt
	@echo "Installing package in editable mode..."
	@source env/bin/activate && pip install -e .
	@echo "Setup complete! Run 'make start' to start the server."

# Run tests
test:
	@source env/bin/activate && pytest

# Format code with black and isort
format:
	@echo "Formatting code with black..."
	@source env/bin/activate && black .
	@echo "Sorting imports with isort..."
	@source env/bin/activate && isort .

# Lint code with flake8
lint:
	@echo "Linting code with flake8..."
	@source env/bin/activate && flake8 .

# Type check with mypy
type-check:
	@echo "Type checking with mypy..."
	@source env/bin/activate && mypy *.py tests/*.py

# Run all checks (format, lint, type-check, test)
check-all: format lint type-check test
	@echo "All checks completed!"

# Clean up
clean:
	@echo "Cleaning up..."
	@rm -rf env/
	@rm -rf __pycache__/
	@rm -rf .pytest_cache/
	@echo "Cleanup complete!" 