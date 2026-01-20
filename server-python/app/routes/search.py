from flask import Blueprint, jsonify, request, abort
from app.services import search_service

bp = Blueprint('search', __name__)


@bp.route("/task-context", methods=["POST"])
def search_task_context():
    """Search for task context information using Google Custom Search"""
    try:
        data = request.get_json()
        title = data.get('title', '').strip()
        description = data.get('description', '')
        num_results = data.get('numResults', 5)

        if not title:
            abort(400, description='タイトルを入力してください')

        # Generate optimized search query using AI
        optimized_query = search_service.generate_search_query(title, description)

        # Perform search with optimized query
        search_results = search_service.search_context_info(optimized_query, num_results)

        return jsonify({
            'originalTitle': title,
            'optimizedQuery': optimized_query,
            **search_results
        })
    except Exception as e:
        abort(500, description=str(e))
