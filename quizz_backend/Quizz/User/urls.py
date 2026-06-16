from django.urls import path
from Quizz.User.views import UserListCreateView, UserDetailView, CurrentUserView

urlpatterns = [
    path('', UserListCreateView.as_view(), name='user_list_create'),
    path('me/', CurrentUserView.as_view(), name='user_current'),
    path('<int:pk>/', UserDetailView.as_view(), name='user_detail'),
]
