#!/bin/bash

# Simple Flask startup script (without OpenTelemetry)

# 仮想環境を有効化
source venv/bin/activate

# ポート設定
PORT="${PORT:-5000}"

echo "=========================================="
echo "Starting Flask Application"
echo "=========================================="
echo "Port: $PORT"
echo "=========================================="

# Flask アプリを起動
flask --app app.main:app run \
    --host 0.0.0.0 \
    --port $PORT \
    --debug
