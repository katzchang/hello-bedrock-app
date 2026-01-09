import { InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import bedrockClient, { MODEL_ID } from '../config/bedrock.js';

const invokeModel = async (prompt) => {
  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 2000,
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

  try {
    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    return responseBody.content[0].text;
  } catch (error) {
    console.error('Bedrock API Error:', error);
    const bedrockError = new Error('AWS Bedrockサービスでエラーが発生しました');
    bedrockError.name = 'BedrockError';
    throw bedrockError;
  }
};

export const generateTasks = async (userInput) => {
  const prompt = `あなたは便利なタスク管理アシスタントです。ユーザーの目標に基づいて、3〜7個の具体的で実行可能なタスクのリストを生成してください。

ユーザーの目標: "${userInput}"

以下のJSON形式でタスクを生成してください：
[
  {
    "title": "タスクのタイトル",
    "description": "簡潔な説明",
    "estimatedCategory": "カテゴリ",
    "estimatedPriority": "優先度"
  }
]

カテゴリ: work（仕事）, personal（個人）, shopping（買い物）, health（健康）, other（その他）
優先度: low（低）, medium（中）, high（高）, urgent（緊急）

JSON配列のみを返してください。追加のテキストは不要です。`;

  const response = await invokeModel(prompt);

  try {
    const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const tasks = JSON.parse(cleanedResponse);
    return tasks;
  } catch (error) {
    console.error('Failed to parse AI response:', response);
    throw new Error('AI応答の解析に失敗しました');
  }
};

export const classifyTask = async (title, description = '') => {
  const prompt = `このタスクを分析して、最も適切なカテゴリと関連するタグを提案してください。

タスクのタイトル: "${title}"
タスクの説明: "${description}"

カテゴリ: work（仕事）, personal（個人）, shopping（買い物）, health（健康）, other（その他）

以下のJSON形式で応答してください：
{
  "category": "提案されたカテゴリ",
  "tags": ["タグ1", "タグ2", "タグ3"],
  "reasoning": "簡単な説明"
}

JSON のみを返してください。`;

  const response = await invokeModel(prompt);

  try {
    const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleanedResponse);
    return result;
  } catch (error) {
    console.error('Failed to parse AI response:', response);
    throw new Error('AI応答の解析に失敗しました');
  }
};

export const setPriority = async (title, description = '', deadline = null) => {
  const prompt = `このタスクを分析して、適切な優先度を提案してください。

タスクのタイトル: "${title}"
タスクの説明: "${description}"
${deadline ? `期限: ${deadline}` : ''}

優先度レベル:
- urgent（緊急）: 重要で即座に対応が必要
- high（高）: 重要で早めに対応が必要
- medium（中）: 比較的早めに対応すべき
- low（低）: いつでも対応可能

以下のJSON形式で応答してください：
{
  "priority": "優先度レベル",
  "reasoning": "この優先度を選択した理由の簡単な説明",
  "urgencyFactors": ["要因1", "要因2"]
}

JSONのみを返してください。`;

  const response = await invokeModel(prompt);

  try {
    const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleanedResponse);
    return result;
  } catch (error) {
    console.error('Failed to parse AI response:', response);
    throw new Error('AI応答の解析に失敗しました');
  }
};
