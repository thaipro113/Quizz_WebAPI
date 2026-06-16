from rest_framework import serializers
from Quizz.models import Question, Answer

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'question', 'content', 'is_correct']
        read_only_fields = ['question']

class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'quiz', 'content', 'order', 'created_at', 'answers']
        read_only_fields = ['quiz', 'created_at']
