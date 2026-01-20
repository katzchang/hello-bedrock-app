import axios from 'axios';
import { InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import bedrockClient, { MODEL_ID } from '../config/bedrock.js';

const GOOGLE_API_KEY = process.env.GOOGLE_SEARCH_API_KEY;
const GOOGLE_SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;
const GOOGLE_SEARCH_URL = 'https://www.googleapis.com/customsearch/v1';

/**
 * Search for context information using Google Custom Search API
 */
export const searchContextInfo = async (query, numResults = 5) => {
  if (!GOOGLE_API_KEY || !GOOGLE_SEARCH_ENGINE_ID) {
    throw new Error('Google Search APIの設定が不足しています。GOOGLE_SEARCH_API_KEYとGOOGLE_SEARCH_ENGINE_IDを設定してください。');
  }

  try {
    const response = await axios.get(GOOGLE_SEARCH_URL, {
      params: {
        key: GOOGLE_API_KEY,
        cx: GOOGLE_SEARCH_ENGINE_ID,
        q: query,
        num: numResults,
        lr: 'lang_ja', // Prefer Japanese results
        safe: 'active'
      },
      timeout: 10000 // 10 second timeout
    });

    const results = response.data.items?.map(item => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      displayLink: item.displayLink
    })) || [];

    return {
      query,
      results,
      totalResults: response.data.searchInformation?.totalResults || 0,
      searchTime: response.data.searchInformation?.searchTime || 0
    };
  } catch (error) {
    if (error.response?.status === 429) {
      throw new Error('Google Search APIのレート制限に達しました。しばらく待ってから再試行してください。');
    } else if (error.response?.status === 403) {
      throw new Error('Google Search APIの認証に失敗しました。APIキーと検索エンジンIDを確認してください。');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Google Search APIのタイムアウト。ネットワーク接続を確認してください。');
    }
    console.error('Google Search API Error:', error);
    throw new Error('検索中にエラーが発生しました');
  }
};

/**
 * Generate optimized search query from task information using AI
 */
export const generateSearchQuery = async (title, description = '') => {
  const prompt = `あなたは検索クエリ最適化の専門家です。以下のタスク情報から、最も関連性の高い情報を見つけるための最適な検索クエリを生成してください。

タスクのタイトル: "${title}"
タスクの説明: "${description}"

要件:
- 検索クエリは具体的で、情報が見つかりやすいものにする
- 不要な言葉を削除し、キーワードを抽出する
- 検索結果が多すぎず少なすぎないバランスの取れたクエリにする
- 日本語の検索クエリを生成する
- 1〜5語程度の簡潔なクエリにする

検索クエリのみを返してください。JSONやその他のフォーマットは不要です。`;

  try {
    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    };

    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload)
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const optimizedQuery = responseBody.content[0].text.trim();

    return optimizedQuery;
  } catch (error) {
    console.error('Failed to generate search query with AI:', error);
    // Fallback: use title as-is
    return title;
  }
};
