from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import authenticate, login
from .models import User
from .serializers import UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        """Регистрация нового пользователя (POST /api/users/)"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # Хешируем пароль
        password = request.data.get('password')
        if password:
            user.set_password(password)
            user.save()
        login(request, user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return Response(UserSerializer(user).data)
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def me(self, request):
        if request.user.is_authenticated:
            return Response(UserSerializer(request.user).data)
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)