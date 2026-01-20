from flask import Blueprint, jsonify, request, abort
from app.services import bedrock_service

bp = Blueprint('ai', __name__)


@bp.route("/generate-tasks", methods=["POST"])
def generate_tasks():
    """Generate tasks from user description"""
    try:
        data = request.get_json()
        description = data.get('description', '').strip()

        if not description:
            abort(400, description='説明を入力してください')

        tasks = bedrock_service.generate_tasks(description)
        return jsonify({'tasks': tasks})
    except Exception as e:
        abort(500, description=str(e))


@bp.route("/classify-task", methods=["POST"])
def classify_task():
    """Classify task and suggest tags"""
    try:
        data = request.get_json()
        title = data.get('title', '').strip()
        description = data.get('description', '')

        if not title:
            abort(400, description='タイトルを入力してください')

        result = bedrock_service.classify_task(title, description)
        return jsonify(result)
    except Exception as e:
        abort(500, description=str(e))


@bp.route("/set-priority", methods=["POST"])
def set_priority():
    """Set task priority based on content and deadline"""
    try:
        data = request.get_json()
        title = data.get('title', '').strip()
        description = data.get('description', '')
        deadline = data.get('deadline')

        if not title:
            abort(400, description='タイトルを入力してください')

        result = bedrock_service.set_priority(title, description, deadline)
        return jsonify(result)
    except Exception as e:
        abort(500, description=str(e))


@bp.route("/generate-execution-guide", methods=["POST"])
def generate_execution_guide():
    """Generate step-by-step execution guide"""
    try:
        data = request.get_json()
        title = data.get('title', '').strip()
        description = data.get('description', '')
        category = data.get('category', 'other')
        priority = data.get('priority', 'medium')

        if not title:
            abort(400, description='タイトルを入力してください')

        result = bedrock_service.generate_execution_guide(
            title, description, category, priority
        )
        return jsonify(result)
    except Exception as e:
        abort(500, description=str(e))


@bp.route("/generate-completion-message", methods=["POST"])
def generate_completion_message():
    """Generate completion celebration message"""
    try:
        data = request.get_json()
        title = data.get('title', '').strip()
        description = data.get('description', '')
        category = data.get('category', 'other')

        if not title:
            abort(400, description='タイトルを入力してください')

        result = bedrock_service.generate_completion_message(
            title, description, category
        )
        return jsonify(result)
    except Exception as e:
        abort(500, description=str(e))


@bp.route("/detect-stale-tasks", methods=["POST"])
def detect_stale_tasks():
    """Detect and encourage stale tasks"""
    try:
        data = request.get_json()
        todos = data.get('todos', [])

        if not todos or len(todos) == 0:
            abort(400, description='タスクリストを提供してください')

        result = bedrock_service.detect_stale_tasks(todos)
        return jsonify(result)
    except Exception as e:
        abort(500, description=str(e))


@bp.route("/recommend-tasks", methods=["POST"])
def recommend_tasks():
    """Recommend next tasks based on dependencies and priority"""
    try:
        data = request.get_json()
        todos = data.get('todos', [])

        if not todos or len(todos) == 0:
            abort(400, description='タスクリストを提供してください')

        result = bedrock_service.recommend_tasks(todos)
        return jsonify(result)
    except Exception as e:
        abort(500, description=str(e))
