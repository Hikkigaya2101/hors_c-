from rest_framework import viewsets, permissions
from .models import Task, Project
from .serializers import TaskSerializer, ProjectSerializer

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Task.objects.none()  # для роутера, но переопределим get_queryset

    def get_queryset(self):
        # возвращаем задачи, где пользователь является исполнителем или создателем проекта
        return Task.objects.filter(assignee=self.request.user)

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Project.objects.none()

    def get_queryset(self):
        return Project.objects.filter(team__members=self.request.user)