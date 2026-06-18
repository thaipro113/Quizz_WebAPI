from rest_framework import serializers
from Quizz.models import User

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(required=False, default='student')
    password = serializers.CharField(write_only=True, required=False)
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
        fields = ['id', 'username', 'email', 'role', 'is_active', 'created_at', 'password']
        read_only_fields = ['created_at']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.is_superuser or instance.is_staff:
            representation['role'] = 'admin'
        return representation

    def validate_username(self, value):
        import re
        if not re.match(r'^[a-zA-Z0-9_@.+-]+$', value):
            raise serializers.ValidationError("Tên tài khoản không hợp lệ. Chỉ chấp nhận chữ cái, số và các ký tự: _, @, ., +, -")
        user_id = self.instance.id if self.instance else None
        qs = User.objects.filter(username__iexact=value)
        if user_id:
            qs = qs.exclude(id=user_id)
        if qs.exists():
            raise serializers.ValidationError("Tên tài khoản này đã tồn tại.")
        return value

    def validate_email(self, value):
        if value:
            user_id = self.instance.id if self.instance else None
            qs = User.objects.filter(email__iexact=value)
            if user_id:
                qs = qs.exclude(id=user_id)
            if qs.exists():
                raise serializers.ValidationError("Email này đã được sử dụng bởi một tài khoản khác.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        role = validated_data.get('role', 'student')
        
        if role == 'admin':
            validated_data['is_staff'] = True

        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        role = validated_data.get('role')
        
        if role is not None:
            if role == 'admin':
                instance.is_staff = True
            else:
                if not instance.is_superuser:
                    instance.is_staff = False

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if password:
            instance.set_password(password)
            
        instance.save()
        return instance
