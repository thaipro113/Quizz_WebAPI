from django.utils.decorators import method_decorator
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter
from Quizz.models import User
from Quizz.User.serializers import UserSerializer
from Quizz.permissions import IsAdminUserRole
from Quizz.schemas import (
    user_list_schema,
    user_create_schema,
    user_detail_schema,
    current_user_schema
)

@method_decorator(name='get', decorator=user_list_schema)
@method_decorator(name='post', decorator=user_create_schema)
class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all().order_by('-id')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUserRole]
    filter_backends = [SearchFilter]
    search_fields = ['username', 'email']

@method_decorator(name='get', decorator=user_detail_schema)
@method_decorator(name='put', decorator=user_detail_schema)
@method_decorator(name='patch', decorator=user_detail_schema)
@method_decorator(name='delete', decorator=user_detail_schema)
class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUserRole]

@method_decorator(name='get', decorator=current_user_schema)
@method_decorator(name='put', decorator=current_user_schema)
@method_decorator(name='patch', decorator=current_user_schema)
class CurrentUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
