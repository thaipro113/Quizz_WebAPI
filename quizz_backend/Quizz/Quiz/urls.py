from django.urls import path
from Quizz.Quiz.view import QuizViewSet, QuizDetail

urlpatterns = [
    path('quizzes/', QuizViewSet.as_view(), name='quiz-list'),
    path('quizzes/<int:pk>/', QuizDetail.as_view(), name='quiz-detail'),
]