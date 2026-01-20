# クイックスタートガイド

## 🚀 最速セットアップ (5分)

### 1. 依存関係のインストール

```bash
# Python 仮想環境の作成と有効化
python3 -m venv venv
source venv/bin/activate

# パッケージのインストール
pip install -r requirements.txt

# OpenTelemetry 自動インストルメンテーション
opentelemetry-bootstrap -a install
```

### 2. 環境変数の設定

```bash
# .env ファイルを作成
cp .env.example .env

# 最低限必要な設定を編集
nano .env
```

**必須の設定:**
- `AWS_REGION`: AWS リージョン (例: us-east-1)
- `AWS_ACCESS_KEY_ID`: AWS アクセスキー
- `AWS_SECRET_ACCESS_KEY`: AWS シークレットキー

**オプション (検索機能を使う場合):**
- `GOOGLE_SEARCH_API_KEY`: Google Custom Search API キー
- `GOOGLE_SEARCH_ENGINE_ID`: 検索エンジンID

### 3. サーバーの起動

#### 通常起動 (OpenTelemetry なし)

```bash
./start.sh
```

#### Splunk OpenTelemetry 付き起動

```bash
./start_with_otel.sh
```

サーバーは `http://localhost:5000` で起動します。

### 4. 動作確認

```bash
# ヘルスチェック
curl http://localhost:5000/health

# API ドキュメント
# ブラウザで http://localhost:5000/docs を開く

# タスク生成のテスト
curl -X POST http://localhost:5000/api/ai/generate-execution-guide \
  -H "Content-Type: application/json" \
  -d '{"title":"レポートを作成する","category":"work","priority":"high"}'
```

## 📚 起動スクリプトまとめ

| スクリプト | 用途 | OpenTelemetry |
|-----------|------|---------------|
| `./start.sh` | 通常起動 | ❌ なし |
| `./start_with_otel.sh` | 本番起動 | ✅ あり (OTLP) |
| `./test_otel.sh` | デバッグ起動 | ✅ あり (Console + OTLP) |

## 🔍 トラブルシューティング

### ポートが使用中

```bash
# ポート 5000 を使用しているプロセスを確認
lsof -i :5000

# プロセスを終了
kill -9 $(lsof -ti :5000)
```

### AWS 認証エラー

```bash
# AWS CLI が設定されているか確認
aws configure list

# または .env ファイルで直接設定
```

### OpenTelemetry エラー

```bash
# デバッグモードで起動
export OTEL_LOG_LEVEL=debug
./test_otel.sh
```

## 📖 詳細ドキュメント

- **README.md**: 全体の説明とセットアップ
- **SPLUNK_OBSERVABILITY.md**: Splunk との統合詳細
- **API ドキュメント**: http://localhost:5000/docs

## 🎯 次のステップ

1. **クライアント (React) の起動**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

2. **Splunk Observability Cloud との統合**
   - `SPLUNK_OBSERVABILITY.md` を参照

3. **本番デプロイ**
   - 環境変数を本番用に変更
   - サンプリングレートを調整
   - HTTPS/TLS を設定
