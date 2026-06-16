from django.urls import path
from Quizz.Question.views import (
    QuizQuestionsView,
    QuestionDetailView,
    QuestionAnswersView,
    AnswerDetailView
)

urlpatterns = [
    path('quizzes/<int:quiz_id>/questions/', QuizQuestionsView.as_view(), name='quiz_questions'),
    path('questions/<int:pk>/', QuestionDetailView.as_view(), name='question_detail'),
    path('questions/<int:question_id>/answers/', QuestionAnswersView.as_view(), name='question_answers'),
    path('answers/<int:pk>/', AnswerDetailView.as_view(), name='answer_detail'),
]
