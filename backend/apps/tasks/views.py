from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Project, Task, ProjectChatMessage, TaskChatMessage
from .serializers import ProjectSerializer, TaskSerializer, ProjectChatMessageSerializer, TaskChatMessageSerializer
from apps.users.models import User
from apps.teams.models import Team

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Task.objects.none()

    def get_queryset(self):
        return Task.objects.filter(assignee=self.request.user)

    @action(detail=True, methods=['get', 'post'], url_path='messages')
    def task_messages(self, request, pk=None):
        task = self.get_object()
        if request.method == 'GET':
            messages = task.messages.all()
            serializer = TaskChatMessageSerializer(messages, many=True)
            return Response(serializer.data)
        else:
            text = request.data.get('text')
            if text:
                msg = TaskChatMessage.objects.create(task=task, author=request.user, text=text)
                serializer = TaskChatMessageSerializer(msg)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response({'error': 'text required'}, status=status.HTTP_400_BAD_REQUEST)

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Project.objects.none()

    def get_queryset(self):
        return Project.objects.filter(team__members=self.request.user)

    def perform_create(self, serializer):
        team = Team.objects.create(
            name=serializer.validated_data.get('name'),
            description=serializer.validated_data.get('description', '')
        )
        team.members.add(self.request.user)
        members_ids = self.request.data.get('members', [])
        for member_id in members_ids:
            try:
                user = User.objects.get(id=member_id)
                team.members.add(user)
            except User.DoesNotExist:
                pass
        serializer.save(team=team, created_by=self.request.user)

    def perform_update(self, serializer):
        instance = serializer.instance
        team = instance.team
        team.name = serializer.validated_data.get('name', team.name)
        team.description = serializer.validated_data.get('description', team.description)
        team.save()
        members_ids = self.request.data.get('members', [])
        if members_ids:
            team.members.clear()
            team.members.add(self.request.user)
            for member_id in members_ids:
                try:
                    user = User.objects.get(id=member_id)
                    team.members.add(user)
                except User.DoesNotExist:
                    pass
        serializer.save()

    @action(detail=True, methods=['get', 'post'], url_path='tasks')
    def project_tasks(self, request, pk=None):
        project = self.get_object()
        if request.method == 'GET':
            tasks = Task.objects.filter(project=project)
            serializer = TaskSerializer(tasks, many=True, context={'request': request})
            return Response(serializer.data)
        elif request.method == 'POST':
            serializer = TaskSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save(project=project)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['put', 'patch', 'delete'], url_path='tasks/(?P<task_id>[^/.]+)')
    def project_task_detail(self, request, pk=None, task_id=None):
        project = self.get_object()
        try:
            task = Task.objects.get(project=project, id=task_id)
        except Task.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if request.method == 'DELETE':
            task.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            serializer = TaskSerializer(task, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get', 'post'], url_path='messages')
    def project_messages(self, request, pk=None):
        project = self.get_object()
        if request.method == 'GET':
            messages = project.messages.all()
            serializer = ProjectChatMessageSerializer(messages, many=True)
            return Response(serializer.data)
        else:
            text = request.data.get('text')
            if text:
                msg = ProjectChatMessage.objects.create(project=project, author=request.user, text=text)
                serializer = ProjectChatMessageSerializer(msg)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response({'error': 'text required'}, status=status.HTTP_400_BAD_REQUEST)