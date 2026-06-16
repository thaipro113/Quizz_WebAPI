from django.urls import path
from Quizz.Quiz.views import QuizListCreateView, QuizDetailView

urlpatterns = [
    path('', QuizListCreateView.as_view(), name='quiz_list_create'),
    path('<int:pk>/', QuizDetailView.as_view(), name='quiz_detail'),
]