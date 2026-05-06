from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, ProjectViewSet

router = DefaultRouter()
router.register(r'tasks', TaskViewSet)
router.register(r'projects', ProjectViewSet)
urlpatterns = router.urls