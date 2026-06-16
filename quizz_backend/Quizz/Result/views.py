from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, Max, Min
from Quizz.models import Quiz, Question, Answer, Result, UserAnswer
from Quizz.Result.serializers import QuizSubmissionSerializer, ResultDetailSerializer
from Quizz.permissions import IsTeacherOrAdmin
from Quizz.schemas import (
    quiz_submit_schema,
    result_list_schema,
    result_detail_schema,
    quiz_leaderboard_schema,
    quiz_analytics_schema
)

@method_decorator(name='post', decorator=quiz_submit_schema)
class QuizSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, quiz_id):
        quiz = generics.get_object_or_404(Quiz, pk=quiz_id)
        serializer = QuizSubmissionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated_data = serializer.validated_data
        completed_time = validated_data['completed_time']
        answers_data = validated_data['answers']

        total_questions = quiz.questions.count()
        score = 0

        result = Result.objects.create(
            user=request.user,
            quiz=quiz,
            score=0,
            total_questions=total_questions,
            completed_time=completed_time
        )

        for ans_item in answers_data:
            q_id = ans_item['question_id']
            a_id = ans_item['selected_answer_id']
            
            try:
                question = Question.objects.get(pk=q_id, quiz=quiz)
                selected_answer = Answer.objects.get(pk=a_id, question=question)
                
                UserAnswer.objects.create(
                    result=result,
                    question=question,
                    selected_answer=selected_answer
                )
                
                if selected_answer.is_correct == 1:
                    score += 1
            except (Question.DoesNotExist, Answer.DoesNotExist):
                continue

        result.score = score
        result.save()

        response_serializer = ResultDetailSerializer(result)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

@method_decorator(name='get', decorator=result_list_schema)
class ResultListView(generics.ListAPIView):
    serializer_class = ResultDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'teacher'] or user.is_superuser:
            return Result.objects.all().order_by('-created_at')
        return Result.objects.filter(user=user).order_by('-created_at')

@method_decorator(name='get', decorator=result_detail_schema)
class ResultDetailView(generics.RetrieveAPIView):
    queryset = Result.objects.all()
    serializer_class = ResultDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        result = super().get_object()
        user = self.request.user
        if not (user.role in ['admin', 'teacher'] or user.is_superuser) and result.user != user:
            self.permission_denied(self.request, message="You do not have permission to view this result.")
        return result

@method_decorator(name='get', decorator=quiz_leaderboard_schema)
class QuizLeaderboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, quiz_id):
        quiz = generics.get_object_or_404(Quiz, pk=quiz_id)
        results = Result.objects.filter(quiz=quiz).order_by('-score', 'completed_time')[:10]
        serializer = ResultDetailSerializer(results, many=True)
        return Response(serializer.data)

@method_decorator(name='get', decorator=quiz_analytics_schema)
class QuizAnalyticsView(APIView):
    permission_classes = [IsTeacherOrAdmin]

    def get(self, request, quiz_id):
        quiz = generics.get_object_or_404(Quiz, pk=quiz_id)
        results = Result.objects.filter(quiz=quiz)
        
        total_attempts = results.count()
        if total_attempts == 0:
            return Response({
                "total_attempts": 0,
                "average_score": 0,
                "highest_score": 0,
                "lowest_score": 0
            })
            
        stats = results.aggregate(
            avg_score=Avg('score'),
            max_score=Max('score'),
            min_score=Min('score')
        )
        
        return Response({
            "total_attempts": total_attempts,
            "average_score": round(stats['avg_score'], 2),
            "highest_score": stats['max_score'],
            "lowest_score": stats['min_score']
        })
