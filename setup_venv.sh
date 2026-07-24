#!/usr/bin/env bash
set -e

echo "========================================================"
echo "Setting Up Isolated Python Virtual Environment (.venv)"
echo "========================================================"
echo ""

if [ ! -d ".venv" ]; then
    echo "[1/3] Creating Python virtual environment in .venv..."
    python3 -m venv .venv
    echo "Virtual environment created successfully."
else
    echo "[1/3] Existing .venv directory found."
fi

echo ""
echo "[2/3] Upgrading pip in .venv..."
.venv/bin/python -m pip install --upgrade pip

echo ""
echo "[3/3] Installing all project dependencies from backend/requirements.txt..."
.venv/bin/python -m pip install -r backend/requirements.txt

echo ""
echo "========================================================"
echo "Virtual Environment Setup Complete!"
echo ""
echo "To activate the virtual environment in terminal:"
echo "  source .venv/bin/activate"
echo "========================================================"
