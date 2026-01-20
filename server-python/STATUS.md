# プロジェクト状態

## ✅ 完了項目

### Python サーバー実装
- ✅ FastAPI フレームワークで実装
- ✅ Node.js サーバーの全機能を移植
- ✅ AWS Bedrock (Claude Sonnet 4.5) 統合
- ✅ Google Custom Search API 統合
- ✅ Splunk OpenTelemetry 自動インストルメンテーション対応
- ✅ 全エンドポイントのテスト完了

### 実装済み機能

#### AI 機能
1. **タスク自動生成** - ユーザーの目標から3-7個のタスクを生成
2. **タスク分類** - カテゴリとタグの自動提案
3. **優先度設定** - 内容と期限から優先度を自動設定
4. **実行手順ガイド** - ステップバイステップの実行手順生成
5. **完了祝福メッセージ** - タスク完了時の励ましメッセージ
6. **停滞タスク検出** - 7日以上未更新のタスクを検出・励まし
7. **タスク推薦** - 依存関係分析と次のタスク推薦

#### 検索機能
- Google Custom Search API でコンテキスト情報取得
- AI による検索クエリ最適化

#### TODO 管理
- CRUD 操作 (作成、読み取り、更新、削除)
- フィルタリング (完了状態、カテゴリ、優先度)
- 完了状態の切り替え

### Observability
- ✅ Splunk OpenTelemetry SDK 統合
- ✅ 自動インストルメンテーション設定
- ✅ トレース、メトリクス、ログの送信準備完了
- ✅ プロファイリング有効化

## 🚀 現在の状態

### サーバー
- **状態**: 起動中 ✅
- **ポート**: 5000
- **URL**: http://localhost:5000
- **API ドキュメント**: http://localhost:5000/docs
- **ヘルスチェック**: http://localhost:5000/health

### クライアント
- **状態**: 別ターミナルで起動中と想定
- **ポート**: 5173 (Vite デフォルト)
- **接続先**: http://localhost:5000 (Python サーバー)

## 📋 起動方法まとめ

### 通常起動 (開発時)
```bash
cd server-python
./start.sh
```

### Splunk OpenTelemetry 付き起動
```bash
cd server-python
./start_with_otel.sh
```

### デバッグ起動
```bash
cd server-python
./test_otel.sh
```

## 📊 API エンドポイント

### TODO 管理
- `GET /api/todos` - タスク一覧
- `POST /api/todos` - タスク作成
- `PUT /api/todos/{id}` - タスク更新
- `DELETE /api/todos/{id}` - タスク削除
- `PATCH /api/todos/{id}/complete` - 完了切り替え

### AI 機能
- `POST /api/ai/generate-tasks` - タスク生成
- `POST /api/ai/classify-task` - タスク分類
- `POST /api/ai/set-priority` - 優先度設定
- `POST /api/ai/generate-execution-guide` - 実行手順生成
- `POST /api/ai/generate-completion-message` - 完了メッセージ
- `POST /api/ai/detect-stale-tasks` - 停滞タスク検出
- `POST /api/ai/recommend-tasks` - タスク推薦

### 検索
- `POST /api/search/task-context` - コンテキスト情報検索

## 🔄 Node.js vs Python 比較

| 項目 | Node.js | Python |
|------|---------|--------|
| フレームワーク | Express.js | FastAPI |
| 型安全性 | JavaScript (動的) | Pydantic (静的) |
| API ドキュメント | 手動 | 自動生成 (/docs) |
| 非同期処理 | async/await | async/await |
| OpenTelemetry | Upstream SDK | Splunk SDK ✅ |
| パフォーマンス | 高速 | 高速 (uvicorn) |
| AI for Observability | ❌ 未対応 | ✅ 対応 |

## 🎯 次のステップ

### 1. Splunk Observability Cloud との接続

```bash
# Splunk OpenTelemetry Collector のインストール
curl -sSL https://dl.signalfx.com/splunk-otel-collector.sh > /tmp/splunk-otel-collector.sh
sudo sh /tmp/splunk-otel-collector.sh --realm <YOUR_REALM> --token <YOUR_ACCESS_TOKEN>

# または Docker で実行
docker run -d --name splunk-otel-collector \
    -e SPLUNK_ACCESS_TOKEN=<TOKEN> \
    -e SPLUNK_REALM=<REALM> \
    -p 4317:4317 -p 4318:4318 \
    quay.io/signalfx/splunk-otel-collector:latest

# Python サーバーを OpenTelemetry 付きで起動
./start_with_otel.sh
```

詳細は `SPLUNK_OBSERVABILITY.md` を参照。

### 2. 動作確認

ブラウザで以下を確認：
- http://localhost:5000/docs - API ドキュメント
- http://localhost:5173 - クライアント (React)

### 3. Splunk Observability Cloud で確認

- **APM** → **Services** → `hello-bedrock-app-python`
- **AlwaysOn Profiling** でパフォーマンス分析
- **Infrastructure** でリソース使用状況

## 📚 ドキュメント

- **README.md** - 基本的なセットアップとAPI説明
- **QUICKSTART.md** - 5分でセットアップ
- **SPLUNK_OBSERVABILITY.md** - Splunk 統合の詳細ガイド
- **STATUS.md** - このファイル (現在の状態)

## 🐛 トラブルシューティング

### サーバーが起動しない
```bash
# ポートを確認
lsof -i :5000

# プロセスを終了
kill -9 $(lsof -ti :5000)

# 再起動
./start.sh
```

### AWS 認証エラー
```bash
# 環境変数を確認
cat .env | grep AWS

# または AWS CLI で確認
aws configure list
```

### Splunk に接続できない
```bash
# Collector が起動しているか確認
curl http://localhost:4318/v1/traces

# デバッグモードで起動
export OTEL_LOG_LEVEL=debug
./test_otel.sh
```

## 📞 サポート

- AWS Bedrock の問題: AWS サポート
- Splunk Observability の問題: Splunk サポート
- アプリケーションの問題: このプロジェクトの Issue

---

**最終更新**: 2026-01-14
**バージョン**: 1.0.0
**ステータス**: ✅ 本番準備完了
