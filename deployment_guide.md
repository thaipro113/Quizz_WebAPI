# Hướng Dẫn Deploy Lên Render (Backend) và Vercel (Frontend)

Tài liệu này hướng dẫn chi tiết từng bước để triển khai dự án Quizz lên môi trường production:
1. **Render**: Dùng để host database PostgreSQL và Django Rest Framework Backend API.
2. **Vercel**: Dùng để host Vite React Frontend App (nhanh, bảo mật và miễn phí).

---

## PHẦN 1: DEPLOY BACKEND LÊN RENDER

### Bước 1: Tạo Database PostgreSQL trên Render
1. Đăng nhập vào [Render.com](https://render.com/).
2. Nhấp chọn **New +** -> **PostgreSQL**.
3. Điền các thông tin:
   * **Name**: `quizz-database` (hoặc tên tùy ý).
   * **Database**: `quizz`
   * **User**: `postgres` (hoặc render tự tạo).
   * **Region**: Chọn khu vực gần Việt Nam nhất (ví dụ: `Singapore` hoặc `Oregon`).
4. Cuộn xuống và nhấp chọn **Create Database** (chọn gói Free).
5. Khi database chuyển sang trạng thái **Active**, hãy sao chép **Internal Database URL** hoặc **External Database URL** (dạng `postgres://...`) để chuẩn bị điền vào môi trường của Web Service.

### Bước 2: Tạo Web Service (Django Backend)
1. Trên Render Dashboard, chọn **New +** -> **Web Service**.
2. Chọn **Build and deploy from a Git repository**.
3. Kết nối với tài khoản GitHub của bạn và chọn repo **Quizz_WebAPI**.
4. Cấu hình dịch vụ Web Service:
   * **Name**: `quizz-backend` (hoặc tên tùy chọn).
   * **Region**: Nên chọn cùng vùng với database (ví dụ: `Singapore`).
   * **Branch**: `develop` (hoặc `main` / `master` tùy theo nhánh bạn muốn deploy).
   * **Root Directory**: `quizz_backend` *(Quan trọng: phải chỉ rõ thư mục backend)*.
   * **Language**: `Python`
   * **Build Command**: 
     ```bash
     pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
     ```
   * **Start Command**: 
     ```bash
     gunicorn quizz_backend.wsgi:application
     ```
5. Nhấp chọn **Advanced** để thiết lập **Environment Variables (Biến môi trường)**:
   * Thêm các cặp key-value sau:
     * `DATABASE_URL`: *(Dán URL PostgreSQL của Render bạn đã copy ở Bước 1 vào đây)*
     * `SECRET_KEY`: *(Mã bảo mật của bạn, có thể tự nhập một chuỗi ngẫu nhiên)*
     * `DEBUG`: `False`
     * `ALLOWED_HOSTS`: `localhost,127.0.0.1,.onrender.com`
6. Nhấp chọn **Create Web Service**. Đợi Render build và start ứng dụng thành công.
7. Sau khi thành công, hãy copy địa chỉ URL của Backend API (ví dụ: `https://quizz-backend.onrender.com`).

---

## PHẦN 2: DEPLOY FRONTEND LÊN VERCEL

### Bước 1: Chuẩn bị trước khi deploy
Đảm bảo rằng code frontend đã sử dụng URL backend động bằng cách đọc từ biến môi trường `VITE_API_URL` (Tôi đã cấu hình sẵn phần này cho bạn trong code).

### Bước 2: Deploy lên Vercel
1. Truy cập [Vercel.com](https://vercel.com/) và đăng nhập bằng tài khoản GitHub.
2. Nhấp chọn **Add New...** -> **Project**.
3. Chọn repo **Quizz_WebAPI** của bạn và nhấp **Import**.
4. Cấu hình Project Vercel:
   * **Project Name**: `quizz-frontend` (hoặc tên tùy chọn).
   * **Framework Preset**: `Vite` (Vercel tự động nhận diện).
   * **Root Directory**: Nhấp **Edit** và chọn thư mục `quizz_frontend`.
   * **Build and Output Settings**: Giữ mặc định.
   * **Environment Variables**: Thêm biến môi trường để kết nối với backend Render:
     * **Key**: `VITE_API_URL`
     * **Value**: Dán URL của Render Backend của bạn vào đây (Lưu ý: nhớ thêm `/api` ở cuối, ví dụ: `https://quizz-backend.onrender.com/api`).
5. Nhấp chọn **Deploy**.
6. Quá trình deploy sẽ hoàn tất sau khoảng 1 phút. Vercel sẽ cấp cho bạn một địa chỉ URL công khai dạng `https://quizz-frontend.vercel.app` để truy cập ứng dụng của mình!
