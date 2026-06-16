from rest_framework import serializers
from Quizz.models import Result, UserAnswer
from Quizz.User.serializers import UserSerializer

class UserAnswerDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAnswer
        fields = ['id', 'question', 'selected_answer']

class ResultDetailSerializer(serializers.ModelSerializer):
    user_detail = UserSerializer(source='user', read_only=True)
    user_answers = UserAnswerDetailSerializer(many=True, read_only=True)

    class Meta:
        model = Result
        fields = [
            'id', 'user', 'user_detail', 'quiz', 'score', 
            'total_questions', 'completed_time', 'created_at', 
            'user_answers'
        ]

class SingleUserAnswerSubmitSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    selected_answer_id = serializers.IntegerField()

class QuizSubmissionSerializer(serializers.Serializer):
    completed_time = serializers.IntegerField(min_value=0)
    answers = SingleUserAnswerSubmitSerializer(many=True)
