from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

class User(AbstractUser):
    role = models.CharField(max_length=20, default='student', verbose_name="Phân quyền Admin")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Thời điểm tạo tài khoản")

    def __str__(self):
        return self.username


class Quiz(models.Model):
    title = models.CharField(max_length=255, verbose_name="Tiêu đề của bài thi")
    description = models.TextField(blank=True, verbose_name="Mô tả ngắn hoặc hướng dẫn")
    time_limit = models.IntegerField(default=30, verbose_name="Thời gian làm bài (phút)")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="quizzes",
        verbose_name="Người tạo"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày giờ tạo đề thi")
    is_active = models.BooleanField(default=True, verbose_name="Trạng thái hiển thị")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Thời điểm cập nhật gần nhất")

    def __str__(self):
        return self.title


class Question(models.Model):
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name="questions",
        verbose_name="Thuộc về đề thi nào"
    )
    content = models.TextField(verbose_name="Nội dung câu hỏi")
    order = models.IntegerField(default=1, verbose_name="Thứ tự câu hỏi trong quiz")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Thời điểm tạo câu hỏi")

    def __str__(self):
        return self.content[:50]


class Answer(models.Model):
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name="answers",
        verbose_name="Câu hỏi chứa đáp án này"
    )
    content = models.TextField(verbose_name="Nội dung đáp án")
    is_correct = models.IntegerField(default=0, verbose_name="Đánh dấu đáp án đúng")

    def __str__(self):
        return self.content[:30]


class Result(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="results",
        verbose_name="Người thực hiện bài thi"
    )
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name="results",
        verbose_name="Bài thi được thực hiện"
    )
    score = models.IntegerField(verbose_name="Số câu trả lời đúng")
    total_questions = models.IntegerField(verbose_name="Tổng số câu hỏi trong bài thi")
    completed_time = models.IntegerField(verbose_name="Thời gian làm bài thực tế")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Thời điểm nộp bài")

    def __str__(self):
        return f"{self.user.username} - {self.quiz.title}: {self.score}/{self.total_questions}"


class UserAnswer(models.Model):
    result = models.ForeignKey(
        Result,
        on_delete=models.CASCADE,
        related_name="user_answers",
        verbose_name="Thuộc bài làm nào"
    )
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        verbose_name="Câu hỏi được trả lời"
    )
    selected_answer = models.ForeignKey(
        Answer,
        on_delete=models.CASCADE,
        verbose_name="Đáp án học sinh đã tích chọn"
    )

    def __str__(self):
        return f"Result {self.result.id} - Q: {self.question.id} -> A: {self.selected_answer.id}"