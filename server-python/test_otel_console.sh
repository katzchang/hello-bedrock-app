#!/bin/bash

# OpenTelemetry テストスクリプト (console出力で確認)

source venv/bin/activate

PORT="${PORT:-5000}"

# OpenTelemetry 環境変数設定
export OTEL_SERVICE_NAME="hello-bedrock-app-python"
export OTEL_RESOURCE_ATTRIBUTES="deployment.environment=development,service.version=1.0.0"
export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4317"

# console exporterも有効化してトレースを確認
export OTEL_TRACES_EXPORTER="console,otlp"
export OTEL_METRICS_EXPORTER="console,otlp"
export OTEL_LOGS_EXPORTER="console"
export OTEL_LOG_LEVEL="debug"

echo "=========================================="
echo "Testing OpenTelemetry with Console Output"
echo "=========================================="
echo "Service Name: $OTEL_SERVICE_NAME"
echo "OTLP Endpoint: $OTEL_EXPORTER_OTLP_ENDPOINT"
echo "Port: $PORT"
echo "Traces will be printed to console"
echo "=========================================="

# opentelemetry-instrumentでFlaskアプリをラップ
opentelemetry-instrument \
    flask --app app.main:app run \
    --host 0.0.0.0 \
    --port $PORT \
    --debug
