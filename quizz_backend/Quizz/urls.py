from django.urls import path, include

urlpatterns = [
    path('auth/', include('Quizz.Auth.urls')),
    path('users/', include('Quizz.User.urls')),
    path('quizzes/', include('Quizz.Quiz.urls')),
    path('', include('Quizz.Question.urls')),
    path('', include('Quizz.Result.urls')),
]
