from rest_framework import serializers
from .models import Project, Task

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'team', 'created_by']

class TaskSerializer(serializers.ModelSerializer):
    assignee_name = serializers.CharField(source='assignee.username', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'project', 'assignee', 'assignee_name',
                  'priority', 'status', 'deadline', 'project_name']