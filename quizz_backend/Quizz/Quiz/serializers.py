from rest_framework import serializers
from Quizz.models import Quiz
from Quizz.User.serializers import UserSerializer
from Quizz.Question.serializers import QuestionSerializer

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    created_by_detail = UserSerializer(source='created_by', read_only=True)

    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'description', 'time_limit', 
            'created_by', 'created_by_detail', 'created_at', 
            'updated_at', 'is_active', 'questions'
        ]
        read_only_fields = ['created_by']