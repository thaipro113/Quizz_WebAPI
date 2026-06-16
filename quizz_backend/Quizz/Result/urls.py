from django.urls import path
from Quizz.Result.views import (
    QuizSubmitView,
    ResultListView,
    ResultDetailView,
    QuizLeaderboardView,
    QuizAnalyticsView
)

urlpatterns = [
    path('quizzes/<int:quiz_id>/submit/', QuizSubmitView.as_view(), name='quiz_submit'),
    path('results/', ResultListView.as_view(), name='result_list'),
    path('results/<int:pk>/', ResultDetailView.as_view(), name='result_detail'),
    path('quizzes/<int:quiz_id>/leaderboard/', QuizLeaderboardView.as_view(), name='quiz_leaderboard'),
    path('quizzes/<int:quiz_id>/analytics/', QuizAnalyticsView.as_view(), name='quiz_analytics'),
]
