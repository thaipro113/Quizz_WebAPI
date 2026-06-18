from django.utils.decorators import method_decorator
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from Quizz.models import Question, Answer, Quiz
from Quizz.Question.serializers import QuestionSerializer, AnswerSerializer
from Quizz.permissions import IsTeacherOrAdmin
from Quizz.schemas import (
    quiz_questions_list_schema,
    quiz_question_create_schema,
    question_detail_schema,
    question_answers_list_schema,
    question_answer_create_schema,
    answer_detail_schema
)

@method_decorator(name='get', decorator=quiz_questions_list_schema)
@method_decorator(name='post', decorator=quiz_question_create_schema)
class QuizQuestionsView(generics.ListCreateAPIView):
    serializer_class = QuestionSerializer
    pagination_class = None

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsTeacherOrAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        quiz_id = self.kwargs.get('quiz_id')
        return Question.objects.filter(quiz_id=quiz_id).order_by('order')

    def perform_create(self, serializer):
        quiz_id = self.kwargs.get('quiz_id')
        quiz = generics.get_object_or_404(Quiz, pk=quiz_id)
        serializer.save(quiz=quiz)

@method_decorator(name='get', decorator=question_detail_schema)
@method_decorator(name='put', decorator=question_detail_schema)
@method_decorator(name='patch', decorator=question_detail_schema)
@method_decorator(name='delete', decorator=question_detail_schema)
class QuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsTeacherOrAdmin()]
        return [IsAuthenticated()]

@method_decorator(name='get', decorator=question_answers_list_schema)
@method_decorator(name='post', decorator=question_answer_create_schema)
class QuestionAnswersView(generics.ListCreateAPIView):
    serializer_class = AnswerSerializer
    pagination_class = None

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsTeacherOrAdmin()]
        return [IsAuthenticated()]

    def get_serializer(self, *args, **kwargs):
        if isinstance(kwargs.get('data'), list):
            kwargs['many'] = True
        return super().get_serializer(*args, **kwargs)

    def get_queryset(self):
        question_id = self.kwargs.get('question_id')
        return Answer.objects.filter(question_id=question_id)

    def perform_create(self, serializer):
        question_id = self.kwargs.get('question_id')
        question = generics.get_object_or_404(Question, pk=question_id)
        serializer.save(question=question)

@method_decorator(name='get', decorator=answer_detail_schema)
@method_decorator(name='put', decorator=answer_detail_schema)
@method_decorator(name='patch', decorator=answer_detail_schema)
@method_decorator(name='delete', decorator=answer_detail_schema)
class AnswerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsTeacherOrAdmin()]
        return [IsAuthenticated()]
