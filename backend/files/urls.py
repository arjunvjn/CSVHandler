from django.urls import path
from . import views

urlpatterns = [
    path('upload', views.file_upload, name='file-upload'),
    path('list', views.get_files, name='get-files'),
    path('send_email/<int:id>', views.send_email, name='send-email'),
    path('delete/<int:id>', views.delete_file, name='delete-file'),
    path('delete_row/<int:id>', views.delete_row, name='delete-row'),
    path('<int:id>', views.get_file, name='get-file')
]