#!/bin/bash

# Flask + OpenTelemetry 起動スクリプト (opentelemetry-instrument使用)

# 仮想環境を有効化
source venv/bin/activate

# ポート設定
PORT="${PORT:-5000}"

# OpenTelemetry 環境変数設定
export OTEL_SERVICE_NAME="${OTEL_SERVICE_NAME:-hello-bedrock-app-python}"
export OTEL_RESOURCE_ATTRIBUTES="deployment.environment=development,service.version=1.0.0"
export OTEL_EXPORTER_OTLP_ENDPOINT="${OTEL_EXPORTER_OTLP_ENDPOINT:-http://localhost:4317}"
export OTEL_TRACES_EXPORTER="otlp"
export OTEL_METRICS_EXPORTER="otlp"
export OTEL_LOGS_EXPORTER="otlp"

echo "=========================================="
echo "Starting Flask with OpenTelemetry"
echo "=========================================="
echo "Service Name: $OTEL_SERVICE_NAME"
echo "OTLP Endpoint: $OTEL_EXPORTER_OTLP_ENDPOINT"
echo "Port: $PORT"
echo "=========================================="

# opentelemetry-instrumentでFlaskアプリをラップして起動
opentelemetry-instrument \
    flask --app app.main:app run \
    --host 0.0.0.0 \
    --port $PORT \
    --debug
