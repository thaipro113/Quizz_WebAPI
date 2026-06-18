from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from Quizz.models import Quiz, Question, Answer, Result
from Quizz.Question.serializers import AnswerSerializer
from Quizz.Result.serializers import ResultDetailSerializer

User = get_user_model()

class SerializerPermissionsTestCase(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        
        # Tạo người dùng với các vai trò khác nhau
        self.student = User.objects.create_user(username='student_user', password='password', role='student')
        self.teacher = User.objects.create_user(username='teacher_user', password='password', role='teacher')
        self.admin_user = User.objects.create_user(username='admin_user', password='password', role='admin')
        self.superuser = User.objects.create_superuser(username='superuser_user', password='password')

        # Tạo cấu trúc đề thi
        self.quiz = Quiz.objects.create(title="Test Quiz", time_limit=30, created_by=self.admin_user)
        self.question = Question.objects.create(quiz=self.quiz, content="What is 1+1?", order=1)
        self.correct_answer = Answer.objects.create(question=self.question, content="2", is_correct=1)
        self.incorrect_answer = Answer.objects.create(question=self.question, content="3", is_correct=0)

        # Tạo kết quả thi của học sinh
        self.result = Result.objects.create(
            user=self.student,
            quiz=self.quiz,
            score=1,
            total_questions=1,
            completed_time=5
        )

    def test_answer_serializer_for_student(self):
        # Request của học sinh KHÔNG được nhìn thấy is_correct
        request = self.factory.get('/api/quizzes/')
        request.user = self.student
        
        serializer = AnswerSerializer(self.correct_answer, context={'request': request})
        data = serializer.data
        self.assertNotIn('is_correct', data)

    def test_answer_serializer_for_teacher(self):
        # Request của giáo viên ĐƯỢC phép nhìn thấy is_correct
        request = self.factory.get('/api/quizzes/')
        request.user = self.teacher
        
        serializer = AnswerSerializer(self.correct_answer, context={'request': request})
        data = serializer.data
        self.assertIn('is_correct', data)
        self.assertEqual(data['is_correct'], 1)

    def test_answer_serializer_for_admin(self):
        # Request của admin ĐƯỢC phép nhìn thấy is_correct
        request = self.factory.get('/api/quizzes/')
        request.user = self.admin_user
        
        serializer = AnswerSerializer(self.correct_answer, context={'request': request})
        data = serializer.data
        self.assertIn('is_correct', data)

    def test_answer_serializer_for_superuser(self):
        # Request của superuser ĐƯỢC phép nhìn thấy is_correct
        request = self.factory.get('/api/quizzes/')
        request.user = self.superuser
        
        serializer = AnswerSerializer(self.correct_answer, context={'request': request})
        data = serializer.data
        self.assertIn('is_correct', data)

    def test_result_detail_serializer_embeds_correct_answers_for_student(self):
        # API xem chi tiết kết quả phải hiển thị đúng đáp án kèm is_correct cho học sinh
        request = self.factory.get(f'/api/results/{self.result.id}/')
        request.user = self.student
        
        serializer = ResultDetailSerializer(self.result, context={'request': request})
        data = serializer.data
        
        # Kiểm tra quiz_detail được nhúng thành công
        self.assertIn('quiz_detail', data)
        quiz_detail = data['quiz_detail']
        self.assertIsNotNone(quiz_detail)
        
        # Kiểm tra câu hỏi nằm trong quiz_detail
        self.assertIn('questions', quiz_detail)
        questions = quiz_detail['questions']
        self.assertEqual(len(questions), 1)
        
        # Kiểm tra các câu trả lời được nhúng và chứa trường is_correct
        question = questions[0]
        self.assertIn('answers', question)
        answers = question['answers']
        self.assertEqual(len(answers), 2)
        
        for ans in answers:
            self.assertIn('is_correct', ans)
