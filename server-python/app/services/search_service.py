import os
import json
import re
import requests
from typing import Dict, List
from app.config.bedrock import bedrock_client, MODEL_ID

GOOGLE_API_KEY = os.getenv('GOOGLE_SEARCH_API_KEY')
GOOGLE_SEARCH_ENGINE_ID = os.getenv('GOOGLE_SEARCH_ENGINE_ID')
GOOGLE_SEARCH_URL = 'https://www.googleapis.com/customsearch/v1'


def search_context_info(query: str, num_results: int = 5) -> Dict:
    """Search for context information using Google Custom Search API"""
    if not GOOGLE_API_KEY or not GOOGLE_SEARCH_ENGINE_ID:
        raise Exception('Google Search APIの設定が不足しています。GOOGLE_SEARCH_API_KEYとGOOGLE_SEARCH_ENGINE_IDを設定してください。')

    try:
        response = requests.get(
            GOOGLE_SEARCH_URL,
            params={
                'key': GOOGLE_API_KEY,
                'cx': GOOGLE_SEARCH_ENGINE_ID,
                'q': query,
                'num': num_results,
                'lr': 'lang_ja',  # Prefer Japanese results
                'safe': 'active'
            },
            timeout=10.0
        )

        if response.status_code == 429:
            raise Exception('Google Search APIのレート制限に達しました。しばらく待ってから再試行してください。')
        elif response.status_code == 403:
            raise Exception('Google Search APIの認証に失敗しました。APIキーと検索エンジンIDを確認してください。')

        response.raise_for_status()
        data = response.json()

        results = []
        if 'items' in data:
            results = [
                {
                    'title': item.get('title'),
                    'link': item.get('link'),
                    'snippet': item.get('snippet'),
                    'displayLink': item.get('displayLink')
                }
                for item in data['items']
            ]

        return {
            'query': query,
            'results': results,
            'totalResults': data.get('searchInformation', {}).get('totalResults', 0),
            'searchTime': data.get('searchInformation', {}).get('searchTime', 0)
        }

    except requests.Timeout:
        raise Exception('Google Search APIのタイムアウト。ネットワーク接続を確認してください。')
    except Exception as error:
        if isinstance(error, Exception) and 'Google Search API' in str(error):
            raise
        print(f'Google Search API Error: {error}')
        raise Exception('検索中にエラーが発生しました')


def generate_search_query(title: str, description: str = '') -> str:
    """Generate optimized search query from task information using AI"""
    prompt = f"""あなたは検索クエリ最適化の専門家です。以下のタスク情報から、最も関連性の高い情報を見つけるための最適な検索クエリを生成してください。

タスクのタイトル: "{title}"
タスクの説明: "{description}"

要件:
- 検索クエリは具体的で、情報が見つかりやすいものにする
- 不要な言葉を削除し、キーワードを抽出する
- 検索結果が多すぎず少なすぎないバランスの取れたクエリにする
- 日本語の検索クエリを生成する
- 1〜5語程度の簡潔なクエリにする

検索クエリのみを返してください。JSONやその他のフォーマットは不要です。"""

    try:
        payload = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 100,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        }

        response = bedrock_client.invoke_model(
            modelId=MODEL_ID,
            contentType='application/json',
            accept='application/json',
            body=json.dumps(payload)
        )

        response_body = json.loads(response['body'].read())
        optimized_query = response_body['content'][0]['text'].strip()
        return optimized_query

    except Exception as error:
        print(f'Failed to generate search query with AI: {error}')
        # Fallback: use title as-is
        return title
