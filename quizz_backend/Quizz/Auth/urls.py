from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from Quizz.Auth.views import RegisterView, CustomTokenObtainPairView, LogoutView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='auth_login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='auth_token_refresh'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
]
