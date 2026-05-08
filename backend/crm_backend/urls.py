from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('apps.users.urls')),
    path('api/teams/', include('apps.teams.urls')),
    path('api/tasks/', include('apps.tasks.urls')),
    path('', TemplateView.as_view(template_name='index.html')),
    path('login/', TemplateView.as_view(template_name='login.html')),
    path('register/', TemplateView.as_view(template_name='register.html')),
    path('dashboard/', TemplateView.as_view(template_name='dashboard.html')),
]