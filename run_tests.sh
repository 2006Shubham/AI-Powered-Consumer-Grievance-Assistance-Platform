#!/usr/bin/env bash
set -e

echo "========================================================"
echo "Running Consumer Grievance Platform Test Suite"
echo "========================================================"
echo ""
echo "[1/2] Running Backend Pytest Suite..."
PYTHONPATH=. python -m pytest tests/ --tb=short

echo ""
echo "[2/2] Running Frontend Vitest Suite..."
if [ -d "frontend/node_modules" ]; then
    (cd frontend && npm test -- --run)
else
    echo "Skipping Vitest (node_modules not installed yet)."
fi

echo ""
echo "========================================================"
echo "All Tests Passed Successfully!"
echo "========================================================"
