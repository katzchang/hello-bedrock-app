# AWS Bedrock TODO API - Python版

FastAPIを使用したAI搭載タスク管理API (Python実装)

## 特徴

- **FastAPI**: 高速で非同期サポート、自動APIドキュメント生成
- **AWS Bedrock**: Claude Sonnet 4.5 を使用したAI機能
- **Google Custom Search API**: コンテキスト情報検索
- **OpenTelemetry対応**: Splunk AI for Observabilityとの統合

## セットアップ

### 1. Python環境の準備

```bash
# Python 3.9+ が必要
python --version

# 仮想環境の作成（推奨）
python -m venv venv

# 仮想環境の有効化
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate
```

### 2. 依存パッケージのインストール

```bash
cd server-python
pip install -r requirements.txt
```

### 3. 環境変数の設定

`.env.example` をコピーして `.env` を作成し、必要な値を設定：

```bash
cp .env.example .env
```

必須の環境変数：
- `AWS_REGION`: AWS リージョン (例: us-east-1)
- `AWS_ACCESS_KEY_ID`: AWS アクセスキー
- `AWS_SECRET_ACCESS_KEY`: AWS シークレットキー
- `GOOGLE_SEARCH_API_KEY`: Google Custom Search API キー
- `GOOGLE_SEARCH_ENGINE_ID`: 検索エンジンID

### 4. サーバーの起動

#### 方法1: Splunk OpenTelemetry 自動インストルメンテーション (推奨)

```bash
# 起動スクリプトを使用
./start_with_otel.sh

# または手動で実行
source venv/bin/activate
opentelemetry-instrument \
    --traces_exporter otlp \
    --metrics_exporter otlp \
    --logs_exporter otlp \
    uvicorn app.main:app --reload --port 5000
```

自動的に以下がトレースされます：
- FastAPI リクエスト/レスポンス
- AWS Bedrock API 呼び出し
- HTTP クライアント (httpx, requests)
- 非同期処理 (asyncio)

#### 方法2: OpenTelemetry なし (通常起動)

```bash
# 起動スクリプトを使用
./start.sh

# または直接起動
source venv/bin/activate
uvicorn app.main:app --reload --port 5000
```

サーバーは `http://localhost:5000` で起動します。

## API ドキュメント

FastAPIの自動生成ドキュメント：
- Swagger UI: `http://localhost:5000/docs`
- ReDoc: `http://localhost:5000/redoc`

## API エンドポイント

### Todos
- `GET /api/todos` - タスク一覧取得
- `GET /api/todos/{id}` - 特定タスク取得
- `POST /api/todos` - タスク作成
- `PUT /api/todos/{id}` - タスク更新
- `DELETE /api/todos/{id}` - タスク削除
- `PATCH /api/todos/{id}/complete` - 完了状態切り替え

### AI機能
- `POST /api/ai/generate-tasks` - タスク自動生成
- `POST /api/ai/classify-task` - タスク分類
- `POST /api/ai/set-priority` - 優先度設定
- `POST /api/ai/generate-execution-guide` - 実行手順生成
- `POST /api/ai/generate-completion-message` - 完了祝福メッセージ
- `POST /api/ai/detect-stale-tasks` - 停滞タスク検出
- `POST /api/ai/recommend-tasks` - タスク推薦

### 検索
- `POST /api/search/task-context` - コンテキスト情報検索

## テスト

```bash
# 実行手順ガイドのテスト
curl -X POST http://localhost:5000/api/ai/generate-execution-guide \
  -H "Content-Type: application/json" \
  -d '{"title":"レポートを作成する","description":"四半期の売上レポート","category":"work","priority":"high"}'

# 完了メッセージのテスト
curl -X POST http://localhost:5000/api/ai/generate-completion-message \
  -H "Content-Type: application/json" \
  -d '{"title":"ジムに行く","description":"有酸素運動30分","category":"health"}'
```

## Splunk AI for Observability との統合

### セットアップ手順

#### 1. Splunk OpenTelemetry Collector のインストール

```bash
# Linux の場合
curl -sSL https://dl.signalfx.com/splunk-otel-collector.sh > /tmp/splunk-otel-collector.sh
sudo sh /tmp/splunk-otel-collector.sh --realm <YOUR_REALM> --token <YOUR_ACCESS_TOKEN>

# または Docker で実行
docker run --name splunk-otel-collector -d \
    -e SPLUNK_ACCESS_TOKEN=<YOUR_ACCESS_TOKEN> \
    -e SPLUNK_REALM=<YOUR_REALM> \
    -p 4317:4317 -p 4318:4318 \
    quay.io/signalfx/splunk-otel-collector:latest
```

#### 2. 自動インストルメンテーションの設定

```bash
# 依存パッケージのインストール (既に完了)
pip install splunk-opentelemetry[instrumentation]

# 自動インストルメンテーションパッケージをインストール
opentelemetry-bootstrap -a install
```

#### 3. アプリケーションの起動

```bash
# Splunk OpenTelemetry 付きで起動
./start_with_otel.sh

# または環境変数を設定して起動
export OTEL_SERVICE_NAME=hello-bedrock-app-python
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
export SPLUNK_PROFILER_ENABLED=true

opentelemetry-instrument uvicorn app.main:app --reload --port 5000
```

#### 4. Splunk Observability Cloud で確認

1. **APM**: `APM` → `Services` → `hello-bedrock-app-python` でトレース確認
2. **Metrics**: CPU、メモリ、リクエストレートなどのメトリクス
3. **Profiling**: CPU/メモリプロファイリングデータ
4. **Logs**: アプリケーションログとトレースの相関

### 自動トレースされる内容

- **FastAPI エンドポイント**: すべてのHTTPリクエスト/レスポンス
- **AWS Bedrock API**: Claude モデルの呼び出し
- **HTTP クライアント**: httpx, requests による外部API呼び出し (Google Search など)
- **非同期処理**: asyncio タスク
- **データベース**: 将来的にデータベースを追加した場合

### トラブルシューティング

#### Collector に接続できない場合

```bash
# エンドポイントを確認
curl http://localhost:4318/v1/traces

# ログを確認
docker logs splunk-otel-collector

# ポートが開いているか確認
netstat -an | grep 4317
```

#### トレースが表示されない場合

```bash
# OTEL_LOG_LEVEL を debug に設定
export OTEL_LOG_LEVEL=debug
./start_with_otel.sh

# スタートアップログで OpenTelemetry が有効化されているか確認
```

### 環境変数リファレンス

| 環境変数 | 説明 | デフォルト値 |
|---------|------|-------------|
| `OTEL_SERVICE_NAME` | サービス名 | hello-bedrock-app-python |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OTLP エンドポイント | http://localhost:4317 |
| `SPLUNK_PROFILER_ENABLED` | CPU プロファイラー有効化 | true |
| `SPLUNK_PROFILER_MEMORY_ENABLED` | メモリプロファイラー有効化 | true |
| `SPLUNK_METRICS_ENABLED` | メトリクス送信有効化 | true |
| `OTEL_TRACES_SAMPLER` | トレースサンプリング | always_on |
| `OTEL_LOG_LEVEL` | ログレベル | info |

## プロジェクト構造

```
server-python/
├── app/
│   ├── __init__.py
│   ├── main.py              # メインアプリケーション
│   ├── config/
│   │   ├── __init__.py
│   │   └── bedrock.py       # AWS Bedrock設定
│   ├── models/
│   │   ├── __init__.py
│   │   └── todo.py          # Pydanticモデル
│   ├── services/
│   │   ├── __init__.py
│   │   ├── bedrock_service.py   # AI機能
│   │   ├── search_service.py    # Google検索
│   │   └── todos_service.py     # データ管理
│   └── routes/
│       ├── __init__.py
│       ├── todos.py         # TODOルート
│       ├── ai.py            # AIルート
│       └── search.py        # 検索ルート
├── data/
│   └── todos.json           # データストレージ
├── requirements.txt         # 依存パッケージ
├── .env.example            # 環境変数テンプレート
└── README.md               # このファイル
```

## トラブルシューティング

### AWS認証エラー
- `.env` でAWS認証情報が正しく設定されているか確認
- AWS CLIで `aws configure` が設定されているか確認

### Google Search APIエラー
- APIキーと検索エンジンIDが正しいか確認
- APIキーの制限設定を確認
- 無料枠（100検索/日）の制限に達していないか確認

### ポートが使用中
```bash
# 別のポートで起動
PORT=8000 python -m app.main
```
