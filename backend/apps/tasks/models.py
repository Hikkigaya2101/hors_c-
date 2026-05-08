from django.db import models
from apps.users.models import User
from apps.teams.models import Team

class Project(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='projects')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class Task(models.Model):
    PRIORITY = [('High', 'Высокий'), ('Medium', 'Средний'), ('Low', 'Низкий')]
    STATUS = [('todo', 'К выполнению'), ('progress', 'В работе'), ('review', 'На проверке'), ('done', 'Готово')]
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    priority = models.CharField(max_length=10, choices=PRIORITY, default='Medium')
    status = models.CharField(max_length=10, choices=STATUS, default='todo')
    deadline = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.title

# Модели чатов
class ProjectChatMessage(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='messages')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.author.username}: {self.text[:20]}"

class TaskChatMessage(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='messages')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.author.username}: {self.text[:20]}"