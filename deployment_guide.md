# Hướng Dẫn Triển Khai (Deploy) & Khắc Phục Sự Cố (Troubleshooting)
# Dự án: Quizz Web Application (Django Backend & Vite React Frontend)

Tài liệu này tổng hợp toàn bộ các bước triển khai dự án lên **Render** (cho Database & Backend) và **Vercel** (cho Frontend), kèm theo danh sách các lỗi thường gặp và cách khắc phục chi tiết.

---

## PHẦN 1: QUY TRÌNH TRIỂN KHAI TIÊU CHUẨN

### 1. Triển khai Database PostgreSQL trên Render
1. Đăng nhập vào [Render.com](https://render.com/).
2. Chọn **New +** -> **PostgreSQL**.
3. Cấu hình thông số:
   * **Name**: `quizz-database`
   * **Database**: `quizz`
   * **User**: `postgres`
   * **Region**: Chọn khu vực gần Việt Nam (ví dụ: `Singapore` hoặc `Oregon`).
4. Nhấp **Create Database** (Gói Free).
5. Sau khi database ở trạng thái **Active**:
   * Sao chép **Internal Database URL** (dành cho Web Service Render kết nối nội bộ nhanh nhất).
   * Sao chép **External Database URL** (nếu bạn muốn kết nối từ tool ngoài hoặc từ localhost).

### 2. Triển khai Django Backend trên Render
1. Chọn **New +** -> **Web Service** -> Chọn **Build and deploy from a Git repository**.
2. Chọn repo **Quizz_WebAPI** từ tài khoản GitHub của bạn.
3. Thiết lập thông tin cơ bản:
   * **Name**: `quizz-backend`
   * **Branch**: Nhánh chính của bạn (ví dụ: `main` hoặc `develop`).
   * **Root Directory**: Để trống (Mặc định là thư mục gốc của repo).
   * **Language**: `Python`
4. Cấu hình lệnh chạy (Dành cho việc chạy từ thư mục gốc):
   * **Build Command**:
     ```bash
     pip install -r requirements.txt && python quizz_backend/manage.py collectstatic --noinput && python quizz_backend/manage.py migrate
     ```
   * **Start Command**:
     ```bash
     gunicorn --chdir quizz_backend quizz_backend.wsgi:application
     ```
5. Nhấp chọn **Advanced** và thêm các biến môi trường (**Environment Variables**):
   * `DATABASE_URL`: *(Dán URL PostgreSQL của Render bạn đã copy vào đây)*
   * `SECRET_KEY`: *(Nhập một chuỗi ký tự ngẫu nhiên bất kỳ)*
   * `DEBUG`: `False`
   * `ALLOWED_HOSTS`: `*` *(Hoặc tên miền Render backend của bạn, ví dụ: `.onrender.com`)*
6. Nhấp **Create Web Service**.

### 3. Triển khai Vite React Frontend trên Vercel
1. Truy cập [Vercel.com](https://vercel.com/) và đăng nhập qua GitHub.
2. Chọn **Add New...** -> **Project** -> Chọn repo **Quizz_WebAPI**.
3. Cấu hình Project:
   * **Framework Preset**: `Vite` (Vercel tự động nhận diện).
   * **Root Directory**: Nhấp **Edit** và chọn thư mục `quizz_frontend` *(Bắt buộc để tránh chạy nhầm ở thư mục gốc)*.
   * **Environment Variables**:
     * **Key**: `VITE_API_URL`
     * **Value**: Dán URL Render backend của bạn kèm theo `/api` ở cuối (ví dụ: `https://quizz-webapi.onrender.com/api`).
4. Nhấp **Deploy**.

---

## PHẦN 2: HƯỚNG DẪN KHẮC PHỤC CÁC LỖI THƯỜNG GẶP (TROUBLESHOOTING)

### LỖI BÊN FRONTEND (VERCEL)

#### 1. Lỗi: `vite: command not found` hoặc `Error: Command "vite build" exited with 127`
* **Triệu chứng**: Quá trình build trên Vercel thất bại ngay sau khi chạy lệnh build.
* **Nguyên nhân**: Vercel đang chạy cài đặt dependencies ở thư mục gốc của repo thay vì thư mục `quizz_frontend`. Thư mục gốc không chứa gói `vite`.
* **Cách khắc phục**:
  1. Vào Vercel Dashboard -> chọn dự án của bạn -> **Settings** -> **General**.
  2. Tìm mục **Root Directory**, nhấn **Edit** và đổi thành: `quizz_frontend`.
  3. Bấm **Save**.
  4. Vào tab **Deployments** -> Bấm nút **ba chấm `...`** ở bản deploy lỗi -> Chọn **Redeploy**.

#### 2. Lỗi: Đăng ký/Đăng nhập báo lỗi trả về chuỗi HTML `Not Found` (404)
* **Triệu chứng**: Giao diện đăng ký hiện khung màu đỏ chứa mã HTML `<!doctype html> <html lang="en"> <head> <title>Not Found</title>...`.
* **Nguyên nhân**: Frontend gửi yêu cầu API sai đường dẫn (thiếu tiền tố `/api/` hoặc trỏ nhầm sang chính tên miền Vercel).
* **Cách khắc phục**:
  1. Mở trang Vercel -> **Settings** -> **Environment Variables**.
  2. Kiểm tra lại giá trị biến `VITE_API_URL`. Nó phải chứa đầy đủ phần `/api` ở cuối (ví dụ: `https://quizz-webapi.onrender.com/api`).
  3. Bấm **Save**.
  4. **Quan trọng**: Sau khi sửa biến môi trường, bắt buộc phải vào tab **Deployments** -> Chọn bản build mới nhất -> Bấm nút **ba chấm `...`** -> Chọn **Redeploy** để Vite biên dịch lại mã nguồn với biến mới.

---

### LỖI BÊN BACKEND (RENDER)

#### 3. Lỗi: `python: can't open file '/opt/render/project/src/manage.py': [Errno 2] No such file or directory`
* **Triệu chứng**: Render báo build thất bại ngay bước đầu.
* **Nguyên nhân**: Do file `manage.py` nằm trong thư mục con `quizz_backend` nhưng lệnh chạy của bạn lại tìm ở thư mục gốc ngoài cùng.
* **Cách khắc phục**:
  * Vào Render Dashboard -> chọn dịch vụ backend -> **Settings**.
  * Cập nhật **Build Command** thành:
    ```bash
    pip install -r requirements.txt && python quizz_backend/manage.py collectstatic --noinput && python quizz_backend/manage.py migrate
    ```

#### 4. Lỗi: `ModuleNotFoundError: No module named 'quizz_backend.wsgi'`
* **Triệu chứng**: Quá trình build thành công nhưng Web Service bị tắt ngay lập tức và chuyển sang trạng thái crash/restart liên tục.
* **Nguyên nhân**: Lệnh khởi chạy `gunicorn` tìm kiếm file `wsgi.py` sai thư mục làm việc.
* **Cách khắc phục**:
  * Vào Render -> chọn Web Service -> **Settings**.
  * Cập nhật lại **Start Command** thành:
    ```bash
    gunicorn --chdir quizz_backend quizz_backend.wsgi:application
    ```
    *(Cờ `--chdir quizz_backend` giúp gunicorn trỏ đúng vào thư mục của ứng dụng trước khi khởi chạy)*.

#### 5. Lỗi: `ImproperlyConfigured: The SECRET_KEY setting must not be empty.`
* **Triệu chứng**: Django báo lỗi thiếu Secret Key khi build hoặc deploy.
* **Nguyên nhân**: Chưa thiết lập biến môi trường `SECRET_KEY` trên Render.
* **Cách khắc phục**:
  * Vào Render -> Web Service -> **Environment Variables**.
  * Thêm biến `SECRET_KEY` với một giá trị bất kỳ (ví dụ: `django-insecure-prod-key-12345`).

#### 6. Lỗi: Báo lỗi vượt quá giới hạn dịch vụ gói Free của Render
* **Triệu chứng**: Không thể tạo mới Web Service hoặc Database, Render bắt buộc nhập thẻ thanh toán hoặc báo lỗi Limit.
* **Nguyên nhân**: Gói Free của Render chỉ cho phép chạy đồng thời tối đa **1 Web Service** và **1 Database**.
* **Cách khắc phục**:
  * Truy cập vào trang chủ Render Dashboard.
  * Tìm các dịch vụ cũ không còn dùng nữa, bấm chọn và chọn **Settings** -> cuộn xuống dưới cùng bấm **Delete Web Service** hoặc **Suspend** (Tạm dừng) để giải phóng slot.

---

## PHẦN 3: CÁC THAO TÁC QUẢN TRỊ SAU KHI DEPLOY THÀNH CÔNG

### Tạo tài khoản Admin (Superuser) trên Cloud
Để có thể đăng nhập vào trang quản trị quản lý đề thi và người dùng, bạn cần tạo tài khoản Admin theo các cách sau:

#### Cách 1: Sử dụng Shell trực tuyến của Render (Khuyên dùng)
1. Truy cập trang web Render, chọn Web Service `quizz-backend` của bạn.
2. Chọn mục **Shell** ở menu bên trái.
3. Nhập lệnh sau và bấm Enter:
   ```bash
   python manage.py createsuperuser
   ```
4. Nhập các thông tin Username, Email và Password theo yêu cầu của hệ thống (khi nhập mật khẩu hệ thống sẽ ẩn ký tự, bạn cứ gõ bình thường rồi nhấn Enter).

#### Cách 2: Kết nối database online từ máy cá nhân
1. Vào mục quản trị Database trên Render, sao chép địa chỉ **External Database URL**.
2. Tạm thời mở file `.env` local trên máy tính của bạn và dán dòng sau:
   ```env
   DATABASE_URL=postgres://... (URL database online vừa copy)
   ```
3. Mở Terminal trên máy tính tại thư mục `quizz_backend/` và chạy lệnh:
   ```bash
   python manage.py createsuperuser
   ```
4. Khi chạy xong, tài khoản admin đã được tạo trên database online. Hãy xóa hoặc comment lại dòng `DATABASE_URL` trong file `.env` local của bạn để tránh ảnh hưởng đến việc lập trình cục bộ.
