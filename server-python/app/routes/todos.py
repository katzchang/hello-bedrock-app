from flask import Blueprint, jsonify, request, abort
from app.services import todos_service

bp = Blueprint('todos', __name__)


@bp.route("/", methods=["GET"])
def get_todos():
    """Get all todos with optional filters"""
    try:
        completed = request.args.get('completed')
        if completed is not None:
            completed = completed.lower() == 'true'
        category = request.args.get('category')
        priority = request.args.get('priority')

        todos = todos_service.get_all_todos(completed, category, priority)
        return jsonify(todos)
    except Exception as e:
        abort(500, description=str(e))


@bp.route("/<todo_id>", methods=["GET"])
def get_todo(todo_id):
    """Get a single todo by ID"""
    todo = todos_service.get_todo_by_id(todo_id)
    if not todo:
        abort(404, description='TODOが見つかりません')
    return jsonify(todo)


@bp.route("/", methods=["POST"])
def create_todo():
    """Create a new todo"""
    try:
        todo_data = request.get_json()
        new_todo = todos_service.create_todo(todo_data)
        return jsonify(new_todo), 201
    except Exception as e:
        abort(500, description=str(e))


@bp.route("/<todo_id>", methods=["PUT"])
def update_todo(todo_id):
    """Update an existing todo"""
    try:
        updates = request.get_json()
        updated_todo = todos_service.update_todo(todo_id, updates)
        if not updated_todo:
            abort(404, description='TODOが見つかりません')
        return jsonify(updated_todo)
    except Exception as e:
        abort(500, description=str(e))


@bp.route("/<todo_id>", methods=["DELETE"])
def delete_todo(todo_id):
    """Delete a todo"""
    try:
        success = todos_service.delete_todo(todo_id)
        if not success:
            abort(404, description='TODOが見つかりません')
        return '', 204
    except Exception as e:
        abort(500, description=str(e))


@bp.route("/<todo_id>/complete", methods=["PATCH"])
def toggle_complete(todo_id):
    """Toggle todo completion status"""
    try:
        updated_todo = todos_service.toggle_complete(todo_id)
        if not updated_todo:
            abort(404, description='TODOが見つかりません')
        return jsonify(updated_todo)
    except Exception as e:
        abort(500, description=str(e))
