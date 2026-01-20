from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class TodoBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = 'other'
    priority: str = 'medium'
    tags: Optional[List[str]] = []
    deadline: Optional[str] = None


class TodoCreate(TodoBase):
    pass


class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    tags: Optional[List[str]] = None
    deadline: Optional[str] = None
    completed: Optional[bool] = None


class Todo(TodoBase):
    id: str
    completed: bool = False
    createdAt: str
    updatedAt: str
    completedAt: Optional[str] = None

    class Config:
        from_attributes = True


class GenerateTasksRequest(BaseModel):
    description: str


class ClassifyTaskRequest(BaseModel):
    title: str
    description: Optional[str] = None


class SetPriorityRequest(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: Optional[str] = None


class GenerateExecutionGuideRequest(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = 'other'
    priority: Optional[str] = 'medium'


class GenerateCompletionMessageRequest(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = 'other'


class DetectStaleTasksRequest(BaseModel):
    todos: List[Todo]


class RecommendTasksRequest(BaseModel):
    todos: List[Todo]


class SearchTaskContextRequest(BaseModel):
    title: str
    description: Optional[str] = None
    numResults: Optional[int] = 5
