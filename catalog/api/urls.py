from django.urls import path, re_path, include
from . import views

urlpatterns = [
    path('index/', views.index, name='index'),
    path('currentuser/', views.current_user, name='current-user'),
    path('books/', views.BookListAPIView.as_view(), name='book-list'),
    path('authors/', views.AuthorListApiView.as_view(), name='author-list'),
    path('books/<int:pk>/', views.BookDetailApiView.as_view(), name='book-detail'),
    path('authors/<int:pk>/', views.AuthorDetailApiView.as_view(), name='author-detail'),
    path('my-borrowed/', views.MyBorrowedBooksAPIView.as_view(), name='my-borrowed'),
    path('genres/', views.GenreListAPIView.as_view(), name='genre-list'),
    path('languages/', views.LanguageListAPIView.as_view(), name='language-list'),
    path('create-book/', views.CreateBookAPIView.as_view(), name='create-book'),
    path('create-author/', views.CreateAuthorAPIView.as_view(), name='create-author'),
    path("delete-book/<int:pk>/", views.DeleteBookAPIView.as_view(), name="delete-book"),
    path("delete-author/<int:pk>/", views.DeleteAuthorAPIView.as_view(), name="delete-author"),
    path("books/<int:pk>/edit", views.EditBookAPIView.as_view(), name="edit-book"),
    path("register/", views.RegistrationAPIView.as_view(), name="registration"),
    path("password_reset/", views.PasswordResetAPIView.as_view(), name="password-reset-api"),
    path("password_reset/confirm/<uidb64>/<token>/", views.PasswordResetConfirmAPIView.as_view(), name="password-reset-confirm-api"),
    path("csrf/", views.ping_csrf, name="ping-csrf"),
]