from rest_framework import serializers
from Quizz.models import User

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'is_active', 'created_at']
        read_only_fields = ['created_at']

    def get_role(self, obj):
        if obj.is_superuser or obj.is_staff:
            return 'admin'
        return obj.role
