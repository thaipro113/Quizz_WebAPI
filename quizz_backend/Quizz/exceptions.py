from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

def custom_exception_handler(exc, context):
    # Gọi exception handler mặc định của DRF để xử lý các lỗi DRF nhận biết được
    response = exception_handler(exc, context)

    if response is not None:
        # Cấu trúc phản hồi lỗi chuẩn hóa cho các mã lỗi 4xx
        custom_data = {
            'error': True,
            'status_code': response.status_code,
            'message': 'Đã xảy ra lỗi trong quá trình xử lý yêu cầu.'
        }
        
        # Tùy biến thông điệp (message) dựa trên mã lỗi HTTP
        if response.status_code == 400:
            custom_data['message'] = 'Dữ liệu gửi lên không hợp lệ.'
            custom_data['errors'] = response.data
        elif response.status_code == 401:
            custom_data['message'] = 'Phiên làm việc không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.'
            custom_data['errors'] = response.data
        elif response.status_code == 403:
            custom_data['message'] = 'Bạn không có quyền thực hiện hành động này.'
            custom_data['errors'] = response.data
        elif response.status_code == 404:
            custom_data['message'] = 'Không tìm thấy tài nguyên yêu cầu.'
            custom_data['errors'] = response.data
        else:
            if isinstance(response.data, dict) and 'detail' in response.data:
                custom_data['message'] = response.data['detail']
            else:
                custom_data['message'] = str(exc)
            custom_data['errors'] = response.data

        response.data = custom_data
    else:
        # Xử lý các lỗi hệ thống chưa được kiểm soát (Mã lỗi 500 - ví dụ: KeyError, AttributeError...)
        custom_data = {
            'error': True,
            'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR,
            'message': 'Đã xảy ra lỗi hệ thống phía máy chủ. Vui lòng thử lại sau.'
        }
        
        if settings.DEBUG:
            custom_data['errors'] = str(exc)
            # In traceback ra màn hình console của server để tiện debug khi dev
            import traceback
            traceback.print_exc()
        else:
            custom_data['errors'] = 'Internal Server Error'

        response = Response(custom_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response
