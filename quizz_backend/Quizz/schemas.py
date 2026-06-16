from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from Quizz.Auth.serializers import RegisterSerializer, CustomTokenObtainPairSerializer
from Quizz.User.serializers import UserSerializer
from Quizz.Quiz.serializers import QuizSerializer
from Quizz.Question.serializers import QuestionSerializer, AnswerSerializer
from Quizz.Result.serializers import QuizSubmissionSerializer, ResultDetailSerializer

# --- AUTH SCHEMAS ---
register_schema = swagger_auto_schema(
    operation_description="Đăng ký tài khoản người dùng mới (học sinh hoặc giáo viên).",
    request_body=RegisterSerializer,
    responses={
        201: openapi.Response(
            description="Đăng ký thành công",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    "message": openapi.Schema(type=openapi.TYPE_STRING, example="User registered successfully"),
                    "user": openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            "id": openapi.Schema(type=openapi.TYPE_INTEGER),
                            "username": openapi.Schema(type=openapi.TYPE_STRING),
                            "email": openapi.Schema(type=openapi.TYPE_STRING),
                            "role": openapi.Schema(type=openapi.TYPE_STRING)
                        }
                    )
                }
            )
        ),
        400: "Lỗi dữ liệu đầu vào hoặc tài khoản đã tồn tại"
    },
    tags=['Auth']
)

login_schema = swagger_auto_schema(
    operation_description="Đăng nhập bằng username và password để nhận JWT Token.",
    request_body=CustomTokenObtainPairSerializer,
    responses={
        200: openapi.Response(
            description="Đăng nhập thành công",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    "access": openapi.Schema(type=openapi.TYPE_STRING),
                    "refresh": openapi.Schema(type=openapi.TYPE_STRING),
                    "user": openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            "id": openapi.Schema(type=openapi.TYPE_INTEGER),
                            "username": openapi.Schema(type=openapi.TYPE_STRING),
                            "email": openapi.Schema(type=openapi.TYPE_STRING),
                            "role": openapi.Schema(type=openapi.TYPE_STRING)
                        }
                    )
                }
            )
        ),
        401: "Thông tin đăng nhập không chính xác"
    },
    tags=['Auth']
)

logout_schema = swagger_auto_schema(
    operation_description="Đăng xuất tài khoản, đưa refresh token vào blacklist.",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=["refresh"],
        properties={
            "refresh": openapi.Schema(type=openapi.TYPE_STRING, description="Mã token làm mới cần thu hồi")
        }
    ),
    responses={
        205: "Đăng xuất thành công",
        400: "Token không hợp lệ hoặc thiếu"
    },
    tags=['Auth']
)

# --- USER SCHEMAS ---
user_list_schema = swagger_auto_schema(
    operation_description="Lấy danh sách người dùng (chỉ dành cho Admin, có hỗ trợ tìm kiếm qua parameter `?search=xxx`).",
    responses={200: UserSerializer(many=True)},
    tags=['Users']
)

user_create_schema = swagger_auto_schema(
    operation_description="Tạo tài khoản người dùng mới (chỉ dành cho Admin).",
    request_body=UserSerializer,
    responses={201: UserSerializer(), 400: "Lỗi dữ liệu"},
    tags=['Users']
)

user_detail_schema = swagger_auto_schema(
    operation_description="Xem, cập nhật hoặc xóa tài khoản người dùng cụ thể (chỉ dành cho Admin).",
    tags=['Users']
)

current_user_schema = swagger_auto_schema(
    operation_description="Xem và cập nhật thông tin cá nhân của người dùng hiện tại.",
    responses={200: UserSerializer()},
    tags=['Users']
)

# --- QUIZ SCHEMAS ---
quiz_list_schema = swagger_auto_schema(
    operation_description="Lấy danh sách đề thi (hỗ trợ tìm kiếm theo tiêu đề qua `?search=xxx` và sắp xếp qua `?ordering=xxx`).",
    responses={200: QuizSerializer(many=True)},
    tags=['Quizzes']
)

quiz_create_schema = swagger_auto_schema(
    operation_description="Tạo đề thi trắc nghiệm mới (chỉ dành cho Giáo viên/Admin).",
    request_body=QuizSerializer,
    responses={201: QuizSerializer(), 400: "Lỗi dữ liệu"},
    tags=['Quizzes']
)

quiz_detail_schema = swagger_auto_schema(
    operation_description="Xem, sửa đổi hoặc xóa thông tin đề thi.",
    tags=['Quizzes']
)

# --- QUESTION & ANSWER SCHEMAS ---
quiz_questions_list_schema = swagger_auto_schema(
    operation_description="Lấy toàn bộ danh sách câu hỏi và các lựa chọn của một đề thi trắc nghiệm.",
    responses={200: QuestionSerializer(many=True)},
    tags=['Questions & Answers']
)

quiz_question_create_schema = swagger_auto_schema(
    operation_description="Thêm câu hỏi mới vào đề thi (chỉ dành cho Giáo viên/Admin).",
    request_body=QuestionSerializer,
    responses={201: QuestionSerializer(), 400: "Lỗi dữ liệu"},
    tags=['Questions & Answers']
)

question_detail_schema = swagger_auto_schema(
    operation_description="Xem chi tiết, cập nhật hoặc xóa câu hỏi (chỉ giáo viên cập nhật/xóa).",
    tags=['Questions & Answers']
)

question_answers_list_schema = swagger_auto_schema(
    operation_description="Xem danh sách đáp án lựa chọn của một câu hỏi.",
    responses={200: AnswerSerializer(many=True)},
    tags=['Questions & Answers']
)

question_answer_create_schema = swagger_auto_schema(
    operation_description="Thêm đáp án lựa chọn cho câu hỏi (chỉ dành cho Giáo viên/Admin).",
    request_body=AnswerSerializer,
    responses={201: AnswerSerializer(), 400: "Lỗi dữ liệu"},
    tags=['Questions & Answers']
)

answer_detail_schema = swagger_auto_schema(
    operation_description="Xem, cập nhật hoặc xóa đáp án.",
    tags=['Questions & Answers']
)

# --- RESULT & SUBMISSION SCHEMAS ---
quiz_submit_schema = swagger_auto_schema(
    operation_description="Nộp bài trắc nghiệm. Backend sẽ tự chấm điểm và lưu kết quả cùng các đáp án đã chọn.",
    request_body=QuizSubmissionSerializer,
    responses={201: ResultDetailSerializer(), 400: "Lỗi dữ liệu"},
    tags=['Results & Submissions']
)

result_list_schema = swagger_auto_schema(
    operation_description="Xem lịch sử làm bài. Học sinh chỉ thấy lịch sử cá nhân; Giáo viên/Admin thấy toàn bộ lịch sử thi.",
    responses={200: ResultDetailSerializer(many=True)},
    tags=['Results & Submissions']
)

result_detail_schema = swagger_auto_schema(
    operation_description="Xem chi tiết một lần thi trước đó (bao gồm câu hỏi và đáp án đã chọn).",
    responses={200: ResultDetailSerializer()},
    tags=['Results & Submissions']
)

quiz_leaderboard_schema = swagger_auto_schema(
    operation_description="Xem bảng xếp hạng top 10 điểm cao nhất và thời gian làm bài ngắn nhất của đề thi.",
    responses={200: ResultDetailSerializer(many=True)},
    tags=['Results & Submissions']
)

quiz_analytics_schema = swagger_auto_schema(
    operation_description="Xem phân tích thống kê điểm thi của đề (chỉ dành cho Giáo viên/Admin).",
    responses={
        200: openapi.Response(
            description="Số liệu phân tích đề thi",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    "total_attempts": openapi.Schema(type=openapi.TYPE_INTEGER),
                    "average_score": openapi.Schema(type=openapi.TYPE_NUMBER),
                    "highest_score": openapi.Schema(type=openapi.TYPE_INTEGER),
                    "lowest_score": openapi.Schema(type=openapi.TYPE_INTEGER)
                }
            )
        )
    },
    tags=['Results & Submissions']
)
