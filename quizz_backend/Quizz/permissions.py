from rest_framework import permissions

class IsAdminUserRole(permissions.BasePermission):
    """
    Quyền truy cập chỉ dành cho Admin (role == 'admin' hoặc is_superuser).
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.role == 'admin' or request.user.is_superuser
        )

class IsTeacherOrAdmin(permissions.BasePermission):
    """
    Quyền truy cập dành cho Giáo viên (teacher) hoặc Admin (admin).
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.role in ['teacher', 'admin'] or request.user.is_superuser
        )
