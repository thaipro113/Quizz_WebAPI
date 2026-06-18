from rest_framework import serializers
from Quizz.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(
        required=True,
        error_messages={
            'invalid': 'Địa chỉ email không hợp lệ.',
            'required': 'Vui lòng nhập email.',
            'blank': 'Email không được để trống.'
        }
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role']

    def validate_username(self, value):
        import re
        if not re.match(r'^[a-zA-Z0-9_@.+-]+$', value):
            raise serializers.ValidationError("Tên tài khoản không hợp lệ. Chỉ chấp nhận chữ cái, số và các ký tự: _, @, ., +, -")
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Tên tài khoản này đã tồn tại.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email này đã được sử dụng bởi một tài khoản khác.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'student')
        )
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Nếu là superuser hoặc staff, tự động ánh xạ quyền admin
        role = 'admin' if user.is_superuser or user.is_staff else user.role
        token['role'] = role
        token['username'] = user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Nếu là superuser hoặc staff, tự động ánh xạ quyền admin
        role = 'admin' if self.user.is_superuser or self.user.is_staff else self.user.role
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'role': role
        }
        return data
