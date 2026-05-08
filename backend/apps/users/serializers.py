from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone']
        # Поле password НЕ включаем в сериализатор, чтобы оно не сохранялось как обычный текст