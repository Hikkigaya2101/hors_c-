from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

from django.urls import  re_path
from django.views.static import serve
from django.conf import settings


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

if not settings.DEBUG:
    # Отдаём статику фронтенда (если лежит в FRONTEND_BUILD_DIR)
    urlpatterns += [
        re_path(r'^(?P<path>.*)$', serve, {
            'document_root': settings.FRONTEND_BUILD_DIR,
            'path': 'index.html'
        }),
    ]
else:
    # В режиме разработки можно просто перенаправлять на порт Vite,
    # но лучше оставить только API, а фронт запускать отдельно через npm run dev
    # Для удобства добавим заглушку
    urlpatterns += [
        re_path(r'^.*$', TemplateView.as_view(template_name='index.html'), name='spa'),
    ]