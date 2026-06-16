from django.utils.decorators import method_decorator
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from Quizz.models import Quiz
from Quizz.Quiz.serializers import QuizSerializer
from Quizz.permissions import IsTeacherOrAdmin
from Quizz.schemas import (
    quiz_list_schema,
    quiz_create_schema,
    quiz_detail_schema
)

@method_decorator(name='get', decorator=quiz_list_schema)
@method_decorator(name='post', decorator=quiz_create_schema)
class QuizListCreateView(generics.ListCreateAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsTeacherOrAdmin()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

@method_decorator(name='get', decorator=quiz_detail_schema)
@method_decorator(name='put', decorator=quiz_detail_schema)
@method_decorator(name='patch', decorator=quiz_detail_schema)
@method_decorator(name='delete', decorator=quiz_detail_schema)
class QuizDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsTeacherOrAdmin()]
        return [IsAuthenticated()]
