from rest_framework import serializers
from .models import Project, Task

from rest_framework import serializers
from .models import Project, Task

class TaskSerializer(serializers.ModelSerializer):
    assignee_name = serializers.CharField(source='assignee.username', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'project', 'assignee', 'assignee_name',
                  'priority', 'status', 'deadline', 'project_name']
        read_only_fields = ['project']   # project не принимается от клиента, только из URL

class ProjectSerializer(serializers.ModelSerializer):
    members = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'team', 'created_by', 'members']
        read_only_fields = ['team', 'created_by']  # эти поля не принимаются от клиента

    def get_members(self, obj):
        return list(obj.team.members.values_list('id', flat=True))