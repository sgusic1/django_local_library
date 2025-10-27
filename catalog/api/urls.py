from django.urls import path, re_path, include
from . import views

urlpatterns = [
    path('index/', views.index, name='index'),
    path('loggeduser/', views.loggedUser, name='logged-user'),
    path('books/', views.BookListAPIView.as_view(), name='book-list')
]