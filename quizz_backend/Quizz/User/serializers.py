from rest_framework import serializers
from Quizz.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'is_active', 'created_at']
        read_only_fields = ['created_at']
