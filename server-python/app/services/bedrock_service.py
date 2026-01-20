import json
import re
import os
from typing import Dict, List, Any
from langchain_aws import ChatBedrock
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.output_parsers import StrOutputParser

# Initialize ChatBedrock model
MODEL_ID = os.getenv("BEDROCK_MODEL_ID", "us.anthropic.claude-sonnet-4-5-20250929-v1:0")
llm = ChatBedrock(
    model_id=MODEL_ID,
    region_name=os.getenv("AWS_REGION", "us-east-1"),
    model_kwargs={
        "max_tokens": 2000,
        "anthropic_version": "bedrock-2023-05-31"
    }
)

output_parser = StrOutputParser()


def invoke_model(prompt: str, system_message: str = None) -> str:
    """Invoke Claude model via AWS Bedrock using LangChain"""
    try:
        messages = []
        if system_message:
            messages.append(SystemMessage(content=system_message))
        messages.append(HumanMessage(content=prompt))

        # LangChain automatically handles tracing when instrumented
        response = llm.invoke(messages)
        return output_parser.invoke(response)

    except Exception as error:
        print(f'Bedrock API Error: {error}')
        raise Exception('AWS Bedrockサービスでエラーが発生しました')


def generate_tasks(user_input: str) -> List[Dict]:
    """Generate tasks from user description"""
    prompt = f"""あなたは便利なタスク管理アシスタントです。ユーザーの目標に基づいて、3〜7個の具体的で実行可能なタスクのリストを生成してください。

ユーザーの目標: "{user_input}"

以下のJSON形式でタスクを生成してください：
[
  {{
    "title": "タスクのタイトル",
    "description": "簡潔な説明",
    "estimatedCategory": "カテゴリ",
    "estimatedPriority": "優先度"
  }}
]

カテゴリ: work（仕事）, personal（個人）, shopping（買い物）, health（健康）, other（その他）
優先度: low（低）, medium（中）, high（高）, urgent（緊急）

JSON配列のみを返してください。追加のテキストは不要です。"""

    response = invoke_model(prompt)

    try:
        cleaned_response = re.sub(r'```json\n?', '', response)
        cleaned_response = re.sub(r'```\n?', '', cleaned_response).strip()
        tasks = json.loads(cleaned_response)
        return tasks
    except Exception as error:
        print(f'Failed to parse AI response: {response}')
        raise Exception('AI応答の解析に失敗しました')


def classify_task(title: str, description: str = '') -> Dict:
    """Classify task and suggest tags"""
    prompt = f"""このタスクを分析して、最も適切なカテゴリと関連するタグを提案してください。

タスクのタイトル: "{title}"
タスクの説明: "{description}"

カテゴリ: work（仕事）, personal（個人）, shopping（買い物）, health（健康）, other（その他）

以下のJSON形式で応答してください：
{{
  "category": "提案されたカテゴリ",
  "tags": ["タグ1", "タグ2", "タグ3"],
  "reasoning": "簡単な説明"
}}

JSON のみを返してください。"""

    response = invoke_model(prompt)

    try:
        cleaned_response = re.sub(r'```json\n?', '', response)
        cleaned_response = re.sub(r'```\n?', '', cleaned_response).strip()
        result = json.loads(cleaned_response)
        return result
    except Exception as error:
        print(f'Failed to parse AI response: {response}')
        raise Exception('AI応答の解析に失敗しました')


def set_priority(title: str, description: str = '', deadline: str = None) -> Dict:
    """Set task priority based on content and deadline"""
    deadline_text = f"期限: {deadline}" if deadline else ""

    prompt = f"""このタスクを分析して、適切な優先度を提案してください。

タスクのタイトル: "{title}"
タスクの説明: "{description}"
{deadline_text}

優先度レベル:
- urgent（緊急）: 重要で即座に対応が必要
- high（高）: 重要で早めに対応が必要
- medium（中）: 比較的早めに対応すべき
- low（低）: いつでも対応可能

以下のJSON形式で応答してください：
{{
  "priority": "優先度レベル",
  "reasoning": "この優先度を選択した理由の簡単な説明",
  "urgencyFactors": ["要因1", "要因2"]
}}

JSONのみを返してください。"""

    response = invoke_model(prompt)

    try:
        cleaned_response = re.sub(r'```json\n?', '', response)
        cleaned_response = re.sub(r'```\n?', '', cleaned_response).strip()
        result = json.loads(cleaned_response)
        return result
    except Exception as error:
        print(f'Failed to parse AI response: {response}')
        raise Exception('AI応答の解析に失敗しました')


def generate_execution_guide(
    title: str,
    description: str = '',
    category: str = 'other',
    priority: str = 'medium'
) -> Dict:
    """Generate step-by-step execution guide"""
    prompt = f"""あなたは実用的なタスク管理アシスタントです。以下のタスクを完了するための具体的な実行手順を生成してください。

タスクのタイトル: "{title}"
タスクの説明: "{description}"
カテゴリ: {category}
優先度: {priority}

以下のJSON形式で、ステップバイステップの実行手順を生成してください：
{{
  "steps": [
    {{
      "stepNumber": 1,
      "instruction": "具体的な手順の説明",
      "estimatedTime": "推定所要時間（例: 5分、30分、1時間）",
      "tips": "役立つヒントやアドバイス"
    }}
  ],
  "totalEstimatedTime": "全体の推定所要時間",
  "prerequisites": ["事前に必要なこと1", "事前に必要なこと2"],
  "successCriteria": "このタスクが完了したと判断できる基準"
}}

要件:
- 3〜7個のステップに分解してください
- 各ステップは具体的で実行可能であること
- 時間の見積もりは現実的であること
- ヒントは実用的で役立つこと

JSONのみを返してください。"""

    response = invoke_model(prompt)

    try:
        cleaned_response = re.sub(r'```json\n?', '', response)
        cleaned_response = re.sub(r'```\n?', '', cleaned_response).strip()
        result = json.loads(cleaned_response)
        return result
    except Exception as error:
        print(f'Failed to parse AI response: {response}')
        raise Exception('AI応答の解析に失敗しました')


def generate_completion_message(title: str, description: str = '', category: str = 'other') -> Dict:
    """Generate completion celebration message"""
    prompt = f"""あなたは励ましとモチベーションを高めるアシスタントです。ユーザーがタスクを完了しました。心から祝福するメッセージを生成してください。

タスクのタイトル: "{title}"
タスクの説明: "{description}"
カテゴリ: {category}

以下のJSON形式で応答してください：
{{
  "message": "タスク完了を祝福する短いメッセージ（1-2文）",
  "encouragement": "さらなる励ましの言葉や次への動機づけ（1-2文）",
  "emoji": "適切な絵文字1つ（🎉、🎊、⭐、🏆、💪など）"
}}

要件:
- メッセージは明るく前向きで、達成感を感じさせること
- カテゴリに応じた適切な表現を使うこと
- 簡潔で読みやすいこと
- 絵文字は1つだけ

JSONのみを返してください。"""

    response = invoke_model(prompt)

    try:
        cleaned_response = re.sub(r'```json\n?', '', response)
        cleaned_response = re.sub(r'```\n?', '', cleaned_response).strip()
        result = json.loads(cleaned_response)
        return result
    except Exception as error:
        print(f'Failed to parse AI response: {response}')
        raise Exception('AI応答の解析に失敗しました')


def detect_stale_tasks(todos: List[Dict]) -> Dict:
    """Detect and encourage stale tasks (7+ days without update)"""
    from datetime import datetime

    STALE_THRESHOLD_DAYS = 7
    now = datetime.now()

    stale_tasks = []
    for todo in todos:
        if todo.get('completed'):
            continue

        updated_at_str = todo.get('updatedAt') or todo.get('createdAt')
        updated_at = datetime.fromisoformat(updated_at_str.replace('Z', '+00:00'))
        days_since_update = (now - updated_at).days

        if days_since_update >= STALE_THRESHOLD_DAYS:
            stale_tasks.append({
                'id': todo['id'],
                'title': todo['title'],
                'daysSinceUpdate': days_since_update
            })

    if len(stale_tasks) == 0:
        return {
            'staleTasks': [],
            'overallMessage': '',
            'taskMessages': {},
            'actionSuggestion': ''
        }

    prompt = f"""あなたは優しく励ますタスク管理アシスタントです。以下の停滞しているタスクについて、前向きな励ましメッセージを生成してください。

停滞タスク:
{json.dumps(stale_tasks, ensure_ascii=False, indent=2)}

以下のJSON形式で応答してください：
{{
  "overallMessage": "全体的な励ましメッセージ（2-3文）",
  "taskMessages": {{
    "タスクID1": "そのタスク固有の励ましメッセージ（1-2文）",
    "タスクID2": "そのタスク固有の励ましメッセージ（1-2文）"
  }},
  "actionSuggestion": "次に取るべき具体的なアクションの提案（1-2文）"
}}

要件:
- 責めるような表現は避け、前向きで励ます内容にすること
- タスクの停滞理由を推測し、具体的なアドバイスを含めること
- 小さな一歩から始めることを提案すること
- 明るく親しみやすいトーンで書くこと

JSONのみを返してください。"""

    response = invoke_model(prompt)

    try:
        cleaned_response = re.sub(r'```json\n?', '', response)
        cleaned_response = re.sub(r'```\n?', '', cleaned_response).strip()
        result = json.loads(cleaned_response)
        return {
            'staleTasks': [t['id'] for t in stale_tasks],
            'overallMessage': result['overallMessage'],
            'taskMessages': result['taskMessages'],
            'actionSuggestion': result['actionSuggestion']
        }
    except Exception as error:
        print(f'Failed to parse AI response: {response}')
        raise Exception('AI応答の解析に失敗しました')


def recommend_tasks(todos: List[Dict]) -> Dict:
    """Recommend next tasks based on dependencies and priority"""
    prompt = f"""あなたはタスク管理の専門アシスタントです。以下のタスクリストを分析して、依存関係を検出し、次に取り組むべきタスクを推薦してください。

タスクリスト:
{json.dumps(todos, ensure_ascii=False, indent=2)}

以下のJSON形式で応答してください：
{{
  "recommendations": [
    {{
      "taskId": "タスクID",
      "title": "タスクのタイトル",
      "score": 0-100の数値,
      "reason": "推薦理由（日本語）",
      "blockedBy": []
    }}
  ],
  "dependencies": [
    {{
      "taskId": "タスクID",
      "dependsOn": ["依存するタスクID1", "依存するタスクID2"],
      "reasoning": "依存関係の理由"
    }}
  ],
  "insights": "全体的な分析結果やアドバイス"
}}

分析基準：
1. 依存関係の検出：
   - タスクのタイトルと説明を分析し、論理的な順序関係を特定
   - 完了済みタスクは依存関係から除外

2. 推薦スコアリング（優先順位）：
   - ブロックされていない（依存タスクが完了済み）: +40点
   - 優先度が高い（urgent=30, high=20, medium=10, low=5）
   - 他のタスクに依存されている: +15点
   - 作成日が古い: +10点
   - 完了済み: -100点（除外）

3. 推薦リスト：
   - 上位5件のみ返す
   - スコアの高い順にソート
   - 未完了タスクのみ

JSONのみを返してください。"""

    response = invoke_model(prompt)

    try:
        cleaned_response = re.sub(r'```json\n?', '', response)
        cleaned_response = re.sub(r'```\n?', '', cleaned_response).strip()
        result = json.loads(cleaned_response)
        return result
    except Exception as error:
        print(f'Failed to parse AI response: {response}')
        raise Exception('AI応答の解析に失敗しました')
