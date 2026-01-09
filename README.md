# AWS Bedrock統合TODOアプリ

AWS Bedrock (Claude 3.5 Sonnet)を活用したAI機能付きTODO管理アプリケーションです。

## 主な機能

### AI機能 (AWS Bedrock)
- **タスク自動生成**: 目標を入力すると、関連するタスクを自動的に生成
- **タスク分類**: タスクを自動的にカテゴリ分類
- **優先度設定**: タスク内容から優先度を自動提案

### 基本機能
- TODO の作成・編集・削除
- 完了状態の管理
- カテゴリ別・優先度別のフィルタリング
- 検索機能
- レスポンシブデザイン

## 技術スタック

### バックエンド
- Node.js + Express
- AWS SDK v3 (Bedrock Runtime)
- JSON File Storage

### フロントエンド
- React 18
- Vite
- Context API (状態管理)
- Axios (HTTP client)

### AWS
- AWS Bedrock (Claude 3.5 Sonnet)

## セットアップ

### 前提条件
- Node.js v18以上
- AWS アカウント
- AWS Bedrock へのアクセス権限

### 1. リポジトリのクローン

```bash
cd hello-bedrock-app
```

### 2. 依存関係のインストール

```bash
# すべての依存関係を一括インストール
npm run install:all

# または個別にインストール
npm install
cd server && npm install
cd ../client && npm install
```

### 3. 環境変数の設定

#### server/.env

```bash
cd server
cp .env.example .env
```

`.env` ファイルを編集して、AWS認証情報を設定:

```env
NODE_ENV=development
PORT=5000

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
```

#### client/.env

```bash
cd ../client
cp .env.example .env
```

通常は変更不要ですが、必要に応じて編集:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. アプリケーションの起動

#### 開発モード（推奨）

ルートディレクトリから両方のサーバーを同時に起動:

```bash
npm run dev
```

または個別に起動:

```bash
# ターミナル1: バックエンド
cd server
npm run dev

# ターミナル2: フロントエンド
cd client
npm run dev
```

#### 本番モード

```bash
# フロントエンドのビルド
cd client
npm run build

# バックエンドの起動
cd ../server
npm start
```

### 5. アクセス

- フロントエンド: http://localhost:5173
- バックエンドAPI: http://localhost:5000

## API エンドポイント

### TODO CRUD

- `GET /api/todos` - 全TODO取得
- `GET /api/todos/:id` - 単一TODO取得
- `POST /api/todos` - TODO作成
- `PUT /api/todos/:id` - TODO更新
- `DELETE /api/todos/:id` - TODO削除
- `PATCH /api/todos/:id/complete` - 完了状態トグル

### AI機能

- `POST /api/ai/generate-tasks` - タスク自動生成
  ```json
  {
    "description": "誕生日パーティーを企画する"
  }
  ```

- `POST /api/ai/classify-task` - タスク分類
  ```json
  {
    "title": "会議の準備",
    "description": "プレゼン資料作成"
  }
  ```

- `POST /api/ai/set-priority` - 優先度設定
  ```json
  {
    "title": "レポート提出",
    "description": "明日までに提出必要",
    "deadline": "2026-01-09"
  }
  ```

## プロジェクト構造

```
hello-bedrock-app/
├── client/                 # React フロントエンド
│   ├── src/
│   │   ├── components/    # Reactコンポーネント
│   │   ├── context/       # Context API
│   │   ├── services/      # API client
│   │   └── main.jsx
│   └── package.json
│
├── server/                 # Express バックエンド
│   ├── config/            # 設定ファイル
│   ├── controllers/       # ビジネスロジック
│   ├── models/            # データモデル
│   ├── routes/            # APIルート
│   ├── services/          # 外部サービス統合
│   ├── middleware/        # ミドルウェア
│   ├── data/              # JSONデータ保存
│   └── server.js
│
└── package.json           # ルートスクリプト
```

## 使い方

### 1. TODOの追加

1. 「新しいTODOを追加」フォームに情報を入力
2. タイトル（必須）、説明、カテゴリ、優先度を設定
3. 「追加」ボタンをクリック

### 2. AI機能でタスク生成

1. AIアシスタントパネルに目標を入力（例: "結婚式の準備をする"）
2. 「タスクを生成」ボタンをクリック
3. 生成されたタスクを確認
4. 必要なタスクを個別または一括で追加

### 3. TODOの管理

- チェックボックスで完了/未完了を切り替え
- 削除ボタン（🗑️）でTODOを削除
- フィルター機能で表示を絞り込み

### 4. フィルタリング

- **検索**: タイトルや説明でTODOを検索
- **状態**: すべて / 未完了 / 完了
- **カテゴリ**: 仕事 / 個人 / 買い物 / 健康 / その他
- **優先度**: 緊急 / 高 / 中 / 低

## トラブルシューティング

### AI機能が動作しない

- AWS認証情報が正しく設定されているか確認
- AWS Bedrockへのアクセス権限があるか確認
- Claude 3.5 Sonnetモデルが有効化されているか確認
- サーバーログでエラーメッセージを確認

### サーバーが起動しない

- ポート5000が使用可能か確認
- 依存関係が正しくインストールされているか確認
- Node.jsのバージョンを確認（v18以上）

### フロントエンドが表示されない

- バックエンドが起動しているか確認
- CORS設定を確認
- ブラウザのコンソールでエラーを確認

## ライセンス

MIT

## 開発者向け情報

### データストレージ

現在はJSON fileで保存していますが、以下に移行可能:

- SQLite: 軽量でローカル開発に最適
- PostgreSQL: 本番環境での使用に推奨

### 環境変数の管理

本番環境では:
- AWS IAMロールの使用を推奨（アクセスキーは非推奨）
- 環境変数は環境ごとに適切に管理
- `.env`ファイルは決してコミットしない

### セキュリティ

- 入力検証は `express-validator` で実施
- セキュリティヘッダーは `helmet` で設定
- CORS設定は本番環境で適切に制限
- レート制限の実装を推奨

## 今後の拡張案

- [ ] ユーザー認証機能
- [ ] データベース移行（SQLite/PostgreSQL）
- [ ] タスクの期限設定
- [ ] リマインダー通知
- [ ] サブタスク機能
- [ ] タスクの並び替え（ドラッグ&ドロップ）
- [ ] ダークモード
- [ ] モバイルアプリ（React Native）

## Splunk Observability for AI

このアプリケーションはSplunk Observability for AIに対応しています。

### Splunk OpenTelemetry Collectorのセットアップ

アプリケーションのトレースとメトリクスを収集するには、Splunk OpenTelemetry Collectorを設定します。

#### 1. Splunk OTel Collectorのインストール

ローカル環境での開発の場合:

```bash
# Dockerで起動
docker run -d --name splunk-otel-collector \
  -p 4318:4318 \
  -p 13133:13133 \
  -p 55679:55679 \
  -e SPLUNK_ACCESS_TOKEN=your_access_token \
  -e SPLUNK_REALM=us1 \
  -e SPLUNK_HEC_TOKEN=549daa78-b4bf-4dcd-acac-b74f7a104d91 \
  -e SPLUNK_HEC_URL=http://ec2-3-18-225-220.us-east-2.compute.amazonaws.com:8088 \
  quay.io/signalfx/splunk-otel-collector:latest
```

#### 2. Node.js アプリケーションの起動

Splunk OTel Node.jsエージェントを使用してアプリケーションを起動:

```bash
# Splunk OTel Node.js エージェントのインストール
cd server
npm install --save-dev @splunk/otel

# 環境変数を設定して起動
export OTEL_SERVICE_NAME=hello-bedrock-app
export OTEL_RESOURCE_ATTRIBUTES=deployment.environment=development
export SPLUNK_PROFILER_ENABLED=true
export SPLUNK_PROFILER_MEMORY_ENABLED=true

# エージェント付きで起動
node -r @splunk/otel/instrument server.js
```

または、package.jsonにスクリプトを追加:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "dev:otel": "node -r @splunk/otel/instrument server.js"
  }
}
```

#### 3. 環境変数の設定

`server/.env`に以下を追加:

```env
# OpenTelemetry設定
OTEL_SERVICE_NAME=hello-bedrock-app
OTEL_RESOURCE_ATTRIBUTES=deployment.environment=development,service.version=1.0.0
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
SPLUNK_PROFILER_ENABLED=true
SPLUNK_PROFILER_MEMORY_ENABLED=true
```

### 収集されるデータ

Splunk Observability for AIは以下のデータを自動的に収集します：

- **トレース**: HTTP リクエスト、AWS Bedrock API呼び出し
- **メトリクス**: レスポンスタイム、エラー率、スループット
- **AI メトリクス**: LLMトークン使用量、レイテンシ、コスト（将来のカスタム計装で）

### Splunk Observability Cloudでの確認

1. Splunk Observability Cloudにログイン
2. **APM** → **Services** で `hello-bedrock-app` サービスを確認
3. **Service Map** でサービス依存関係を可視化
4. **Trace View** で個々のリクエストを詳細分析

### AWS Bedrock メトリクスの収集

AWS CloudWatch経由でBedrock メトリクスを収集するには:

1. Splunk Observability CloudでAWS連携を設定
2. IAMポリシーに以下の権限を追加:
   ```json
   {
     "bedrock:ListTagsForResource",
     "bedrock:ListFoundationModels",
     "bedrock:GetFoundationModel",
     "bedrock:ListInferenceProfiles"
   }
   ```

詳細は[Splunk Observability for AI ドキュメント](https://docs.splunk.com/observability/en/gdi/monitors-ai/ai-intro.html)を参照してください。
