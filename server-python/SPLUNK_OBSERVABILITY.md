# Splunk Observability Cloud 統合ガイド

このドキュメントでは、FastAPI アプリケーションに Splunk OpenTelemetry を統合し、Splunk Observability Cloud でモニタリングする方法を説明します。

## 前提条件

- Splunk Observability Cloud のアカウント
- Splunk Access Token (Ingest Token)
- Splunk Realm (例: us0, us1, eu0, jp0 など)

## セットアップ手順

### 1. Splunk OpenTelemetry Collector のインストール

#### Linux (推奨)

```bash
curl -sSL https://dl.signalfx.com/splunk-otel-collector.sh > /tmp/splunk-otel-collector.sh
sudo sh /tmp/splunk-otel-collector.sh --realm <YOUR_REALM> --token <YOUR_ACCESS_TOKEN>
```

#### Docker

```bash
docker run --name splunk-otel-collector -d \
    -e SPLUNK_ACCESS_TOKEN=<YOUR_ACCESS_TOKEN> \
    -e SPLUNK_REALM=<YOUR_REALM> \
    -e SPLUNK_CONFIG=/etc/collector.yaml \
    -p 4317:4317 -p 4318:4318 -p 8888:8888 \
    -v $(pwd)/collector-config.yaml:/etc/collector.yaml:ro \
    quay.io/signalfx/splunk-otel-collector:latest
```

#### Docker Compose (開発環境向け)

`docker-compose.yml` を作成：

```yaml
version: '3.8'

services:
  otel-collector:
    image: quay.io/signalfx/splunk-otel-collector:latest
    container_name: splunk-otel-collector
    environment:
      - SPLUNK_ACCESS_TOKEN=${SPLUNK_ACCESS_TOKEN}
      - SPLUNK_REALM=${SPLUNK_REALM}
      - SPLUNK_CONFIG=/etc/collector.yaml
    ports:
      - "4317:4317"   # OTLP gRPC
      - "4318:4318"   # OTLP HTTP
      - "8888:8888"   # Prometheus metrics
      - "13133:13133" # Health check
    volumes:
      - ./collector-config.yaml:/etc/collector.yaml:ro
    restart: unless-stopped

  app:
    build: .
    depends_on:
      - otel-collector
    environment:
      - OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317
      - OTEL_SERVICE_NAME=hello-bedrock-app-python
    ports:
      - "5000:5000"
```

起動：

```bash
export SPLUNK_ACCESS_TOKEN=your_token_here
export SPLUNK_REALM=us0

docker-compose up -d
```

### 2. Python 環境の設定

#### 依存パッケージのインストール

```bash
# すでにインストール済み
pip install splunk-opentelemetry[instrumentation]

# 自動インストルメンテーションパッケージのインストール
opentelemetry-bootstrap -a install
```

#### 環境変数の設定

`.env` ファイルを編集：

```bash
# Splunk Observability Cloud の設定
SPLUNK_REALM=us0
SPLUNK_ACCESS_TOKEN=your_access_token_here

# または、ローカルの Collector を使用
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
OTEL_SERVICE_NAME=hello-bedrock-app-python
OTEL_RESOURCE_ATTRIBUTES=deployment.environment=production,service.version=1.0.0

# プロファイラーとメトリクス
SPLUNK_PROFILER_ENABLED=true
SPLUNK_PROFILER_MEMORY_ENABLED=true
SPLUNK_METRICS_ENABLED=true

# サンプリング設定
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=0.1  # 10% サンプリング (本番環境)

# ログレベル
OTEL_LOG_LEVEL=info
```

### 3. アプリケーションの起動

#### 自動インストルメンテーション (推奨)

```bash
# 起動スクリプトを使用
./start_with_otel.sh

# または直接実行
source venv/bin/activate
opentelemetry-instrument \
    --traces_exporter otlp \
    --metrics_exporter otlp \
    --logs_exporter otlp \
    uvicorn app.main:app --host 0.0.0.0 --port 5000
```

#### コード内で明示的に初期化 (高度な設定)

`app/main.py` に追加：

```python
from splunk_otel.tracing import start_tracing
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

# Splunk OpenTelemetry の初期化
start_tracing()

# FastAPI アプリの作成
app = FastAPI()

# FastAPI の自動インストルメンテーション
FastAPIInstrumentor.instrument_app(app)
```

## Splunk Observability Cloud での確認

### APM (Application Performance Monitoring)

1. Splunk Observability Cloud にログイン
2. **APM** → **Services** → **hello-bedrock-app-python** を選択
3. 以下の情報を確認：
   - **Service Map**: サービス間の依存関係
   - **Traces**: 個別のリクエストトレース
   - **Endpoints**: エンドポイント別のパフォーマンス
   - **Database Queries**: データベース呼び出し (将来追加時)

### Infrastructure Monitoring

- **CPU 使用率**
- **メモリ使用率**
- **ネットワークトラフィック**
- **リクエストレート、レスポンスタイム**

### Profiling

1. **APM** → **AlwaysOn Profiling** を選択
2. サービスを選択してプロファイリングデータを確認：
   - CPU フレームグラフ
   - メモリアロケーション
   - ホットスポット分析

### Log Observer

- **Log Observer** でアプリケーションログを確認
- トレースとログの相関を確認

## カスタムトレースとメトリクス

### カスタムスパンの追加

```python
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

async def my_function():
    with tracer.start_as_current_span("my_custom_operation"):
        # 処理
        result = await some_operation()
        return result
```

### カスタムメトリクスの追加

```python
from opentelemetry import metrics

meter = metrics.get_meter(__name__)

# カウンター
request_counter = meter.create_counter(
    "app.requests",
    description="Number of requests processed"
)

request_counter.add(1, {"endpoint": "/api/todos"})

# ゲージ
active_users = meter.create_up_down_counter(
    "app.active_users",
    description="Number of active users"
)
```

### カスタム属性の追加

```python
from opentelemetry import trace

span = trace.get_current_span()
span.set_attribute("user.id", user_id)
span.set_attribute("task.category", category)
span.set_attribute("ai.model", "claude-sonnet-4.5")
```

## トラブルシューティング

### トレースが送信されない

**確認項目：**

1. Collector が起動しているか確認：
```bash
curl http://localhost:4318/v1/traces
# または
docker logs splunk-otel-collector
```

2. エンドポイントが正しいか確認：
```bash
echo $OTEL_EXPORTER_OTLP_ENDPOINT
```

3. デバッグモードで起動：
```bash
export OTEL_LOG_LEVEL=debug
./start_with_otel.sh
```

### Collector への接続エラー

**エラーメッセージ:**
```
Failed to export traces to http://localhost:4317
```

**解決方法:**
- Collector が起動しているか確認
- ポート 4317 が開いているか確認
- ファイアウォール設定を確認

### パフォーマンスへの影響

**問題:** トレースでアプリが遅くなる

**解決方法:**
- サンプリングレートを調整：
```bash
export OTEL_TRACES_SAMPLER=parentbased_traceidratio
export OTEL_TRACES_SAMPLER_ARG=0.1  # 10% のトレースのみ記録
```

- 不要なインストルメンテーションを無効化：
```bash
export OTEL_PYTHON_DISABLED_INSTRUMENTATIONS=urllib,urllib3
```

## ベストプラクティス

### 1. サービス名の命名規則

```
<application>-<environment>-<component>

例:
- hello-bedrock-app-production-api
- hello-bedrock-app-staging-worker
```

### 2. リソース属性の追加

```bash
export OTEL_RESOURCE_ATTRIBUTES="\
deployment.environment=production,\
service.version=1.2.3,\
service.namespace=bedrock-apps,\
host.name=$(hostname),\
cloud.provider=aws,\
cloud.region=us-east-1"
```

### 3. サンプリング戦略

**開発環境:**
```bash
OTEL_TRACES_SAMPLER=always_on  # すべてのトレース
```

**ステージング環境:**
```bash
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=0.5  # 50% サンプリング
```

**本番環境:**
```bash
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=0.1  # 10% サンプリング
```

### 4. セキュリティ

- **API トークンの保護**: 環境変数または Secret Manager で管理
- **TLS/SSL**: 本番環境では OTLP over TLS を使用
```bash
export OTEL_EXPORTER_OTLP_ENDPOINT=https://ingest.us0.signalfx.com
export OTEL_EXPORTER_OTLP_HEADERS="X-SF-Token=${SPLUNK_ACCESS_TOKEN}"
```

## 参考リンク

- [Splunk OpenTelemetry Python Documentation](https://github.com/signalfx/splunk-otel-python)
- [OpenTelemetry Python API](https://opentelemetry-python.readthedocs.io/)
- [Splunk Observability Cloud Documentation](https://docs.splunk.com/Observability/)
- [OpenTelemetry Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/)
