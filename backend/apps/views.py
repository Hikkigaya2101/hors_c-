from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from .models import User
from .serializers import UserSerializer

from django.contrib.auth import authenticate, login
from rest_framework.decorators import action
from rest_framework.response import Response

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return Response(UserSerializer(user).data)
        return Response({'error': 'Invalid credentials'}, status=400)

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Хешируем пароль
            user.set_password(request.data.get('password'))
            user.save()
            login(request, user)
            return Response(UserSerializer(user).data)
        return Response(serializer.errors, status=400)

    @action(detail=False, methods=['post'])
    def logout(self, request):
        logout(request)
        return Response({'message': 'Logged out'})

    @action(detail=False, methods=['get'])
    def me(self, request):
        if request.user.is_authenticated:
            return Response(UserSerializer(request.user).data)
        return Response({'error': 'Not authenticated'}, status=401)