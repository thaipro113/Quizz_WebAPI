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
    quiz_detail = serializers.SerializerMethodField()

    class Meta:
        model = Result
        fields = [
            'id', 'user', 'user_detail', 'quiz', 'quiz_detail', 'score', 
            'total_questions', 'completed_time', 'created_at', 
            'user_answers'
        ]

    def get_quiz_detail(self, obj):
        from Quizz.Quiz.serializers import QuizSerializer
        context = self.context.copy()
        context['show_correct'] = True
        # Đảm bảo truyền context có request và show_correct
        serializer = QuizSerializer(obj.quiz, context=context)
        return serializer.data

class SingleUserAnswerSubmitSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    selected_answer_id = serializers.IntegerField()

class QuizSubmissionSerializer(serializers.Serializer):
    completed_time = serializers.IntegerField(min_value=0)
    answers = SingleUserAnswerSubmitSerializer(many=True)
