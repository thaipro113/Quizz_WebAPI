# Hệ Thống Thi Trắc Nghiệm Thông Minh (Quizz Web Application)

Chào mừng bạn đến với **Quizz Web Application** - Hệ thống kiểm tra trắc nghiệm trực tuyến thông minh được phát triển trên mô hình Full-stack (Django Rest Framework Backend & React Vite Frontend). 

Dự án cung cấp một nền tảng trực quan, sinh động để tạo đề, thi thử, chấm điểm tự động, xếp hạng và phân tích kết quả học tập chi tiết.

---

## 🚀 Tính Năng Chính

### 1. Phân Quyền Người Dùng (Role-based Authentication)
* **Học sinh (Người dùng)**:
  * Đăng ký, đăng nhập tài khoản an toàn qua token JWT (tự động cơ chế Refresh Token).
  * Xem danh sách đề thi trắc nghiệm.
  * Làm bài kiểm tra trực tuyến có thời gian đếm ngược (Timer).
  * Xem kết quả thi chi tiết (Điểm số, đáp án đúng/sai, giải thích đáp án).
  * Xem bảng xếp hạng (Leaderboard) của từng đề thi.
  * Xem thống kê phân tích quá trình làm bài cá nhân.
* **Giáo viên**:
  * Quản lý ngân hàng đề thi trắc nghiệm (Thêm, sửa, xóa đề thi).
  * Soạn thảo câu hỏi và đáp án trực quan cho từng đề thi.
  * Theo dõi kết quả và thống kê học sinh tham gia làm bài.
* **Quản trị viên (Admin)**:
  * Quyền hạn tối cao trên hệ thống.
  * Quản lý danh sách người dùng (Thêm, sửa đổi thông tin, điều chỉnh trạng thái khóa/mở khóa tài khoản, phân quyền vai trò).

### 2. Giao Diện & Trải Nghiệm (Aesthetics & UX)
* Thiết kế hiện đại, cao cấp với phong cách **Slate Glassmorphism** mượt mà.
* Hỗ trợ **Chế độ Sáng / Tối (Light & Dark Mode)** tự động đồng bộ theo tùy chọn người dùng.
* Micro-animations chuyển đổi giữa các trạng thái và hiệu ứng Hover sống động.
* Responsive hoàn chỉnh hoạt động hoàn hảo trên cả máy tính, máy tính bảng và điện thoại di động.

---

## 🛠️ Công Nghệ Sử Dụng

### Backend API
* **Core**: Python 3.12, Django 5.2
* **API Framework**: Django Rest Framework (DRF)
* **Authentication**: JWT (JSON Web Tokens) qua `djangorestframework-simplejwt`
* **Database**: PostgreSQL (Production) / SQLite (Development & Testing)
* **API Documentation**: Swagger UI & Redoc thông qua `drf-yasg`
* **Static files**: Whitenoise (phục vụ tài nguyên tĩnh trên môi trường Production)

### Frontend App
* **Core**: React 19, Vite, Javascript (ES6+)
* **Routing**: React Router DOM v7
* **API Client**: Axios (với Request/Response Interceptors tự động đính kèm token và refresh token)
* **Styling**: Vanilla CSS nâng cao hỗ trợ biến toàn cục (CSS Variables)
* **Icons**: FontAwesome 6 Pro

### CI/CD
* **GitHub Actions**: Tự động chạy bộ kiểm thử Django và kiểm tra biên dịch Vite frontend trên mỗi pull request và push lên nhánh `main`/`develop`.

---

## 📁 Cấu Trúc Thư Mục Dự Án

```text
├── .github/
│   └── workflows/
│       └── ci.yml             # Cấu hình GitHub Actions CI pipeline
├── quizz_backend/             # Dự án Django Backend API
│   ├── manage.py
│   ├── quizz_backend/         # Cấu hình cài đặt Django, settings, urls
│   └── Quizz/                 # App nghiệp vụ chính (Auth, User, Quiz, Question, Result)
├── quizz_frontend/            # Dự án React Vite Frontend
│   ├── src/
│   │   ├── components/        # Các giao diện hiển thị (Login, Register, Dashboard, Exam...)
│   │   ├── hooks/             # Custom React hooks (useAuth...)
│   │   ├── services/          # Các dịch vụ gọi API (auth, quiz, api)
│   │   └── index.css          # Hệ thống CSS Design Tokens & Styling chính
│   ├── package.json
│   └── vite.config.js
├── requirements.txt           # Thư viện Backend Python
└── deployment_guide.md        # Hướng dẫn chi tiết cách triển khai lên Render/Vercel
```

---

## 💻 Hướng Dẫn Cài Đặt và Chạy Local

### 1. Chuẩn bị Backend
1. Chuyển vào thư mục backend:
   ```bash
   cd quizz_backend
   ```
2. Tạo môi trường ảo và kích hoạt:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate
   ```
3. Cài đặt các thư viện:
   ```bash
   pip install -r ../requirements.txt
   ```
4. Tạo file `.env` kế bên `manage.py` và cấu hình cơ sở dữ liệu:
   ```env
   DB_NAME=quizz
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=127.0.0.1
   DB_PORT=5432
   SECRET_KEY=your_secret_key_here
   DEBUG=True
   ```
5. Chạy các lệnh migrate tạo bảng và khởi chạy server:
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```
   * *Địa chỉ API mặc định: `http://127.0.0.1:8000/api/`*
   * *Tài liệu API Swagger: `http://127.0.0.1:8000/swagger/`*

### 2. Chuẩn bị Frontend
1. Chuyển vào thư mục frontend:
   ```bash
   cd quizz_frontend
   ```
2. Cài đặt các thư viện Node:
   ```bash
   npm install
   ```
3. Chạy môi trường phát triển:
   ```bash
   npm run dev
   ```
   * *Địa chỉ giao diện mặc định: `http://localhost:5173/`*

---

## 🌐 Triển Khai Thực Tế (Deployment)

Dự án đã được cấu hình tối ưu để triển khai trực tiếp lên môi trường Cloud miễn phí:
* **Backend**: Triển khai lên **Render** kết nối PostgreSQL.
* **Frontend**: Triển khai lên **Vercel** kết nối API Render động.

> 📝 Xem hướng dẫn thiết lập chi tiết từng bước và cách xử lý lỗi tại file **[deployment_guide.md](file:///c:/Users/Th%C3%A1i/Quizz-WebAPI/deployment_guide.md)**.
