from rest_framework import serializers
from Quizz.models import Question, Answer

class AnswerSerializer(serializers.ModelSerializer):
    is_correct = serializers.ChoiceField(choices=[(0, 'Sai'), (1, 'Đúng')], default=0, help_text="Nhập 0 nếu đáp án Sai, 1 nếu đáp án Đúng.")

    class Meta:
        model = Answer
        fields = ['id', 'question', 'content', 'is_correct']
        read_only_fields = ['question']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get('request')
        
        # Mặc định ẩn đáp án đúng đối với học sinh
        show_correct = False
        if request and request.user and not request.user.is_anonymous:
            if request.user.is_superuser or getattr(request.user, 'role', 'student') in ['admin', 'teacher']:
                show_correct = True
        
        # Nếu được chỉ định tường minh hiển thị qua context (ví dụ xem kết quả thi)
        if self.context.get('show_correct'):
            show_correct = True
            
        if not show_correct:
            representation.pop('is_correct', None)
            
        return representation

class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'quiz', 'content', 'order', 'created_at', 'answers']
        read_only_fields = ['quiz', 'created_at']
