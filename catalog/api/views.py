from django.http import JsonResponse
from catalog.models import Book, Author, BookInstance, Genre, Language
from .serializers import BookSerializer, AuthorSerializer, GenreSerializer, LanguageSerializer, BookCreateSerializer, BookEditSerializer
from rest_framework import generics, permissions
from rest_framework.pagination import PageNumberPagination
from django.views.decorators.cache import cache_page
from rest_framework.response import Response
from django.views.decorators.http import require_GET
from django.contrib.auth.views import PasswordResetView, PasswordResetConfirmView
from django.shortcuts import redirect
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.forms import SetPasswordForm
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework import status
from django.db.models import RestrictedError
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from django.core.validators import validate_email
from django.contrib.auth import authenticate, login
from rest_framework import serializers



@ensure_csrf_cookie
def ping_csrf(request):
    return JsonResponse({"detail": "CSRF cookie set"})

@cache_page(60)
def index(request):

    """View fucntion for home page of site."""


    num_books = Book.objects.all().count()
    num_instances = BookInstance.objects.all().count()


    num_instances_available = BookInstance.objects.filter(status__exact = 'a').count()

    num_authors = Author.objects.count()

    num_visits = request.session.get('num_visits', 0)
    cookies_accepted = request.COOKIES.get('cookies_accepted')
  
    if cookies_accepted is None: 
        request.session.set_test_cookie()
    elif cookies_accepted == "true":
        if not request.session.test_cookie_worked() and num_visits == 0:
            request.session.set_test_cookie()
        else: 
            num_visits += 1
            request.session['num_visits'] = num_visits
        

    data = {
        'num_books': num_books,
        'num_instances': num_instances,
        'num_instances_available': num_instances_available,
        'num_authors': num_authors,  
        'num_visits': num_visits,
    }

    return JsonResponse(data)

@require_GET
def current_user(request):
    if not (request.user.is_authenticated):
        return JsonResponse({'detail':"Unauthorized"}, status=401)
    
    user = request.user
    return JsonResponse({
        "username": user.username,
        "is_staff": user.is_staff,
        "permissions": list(user.get_all_permissions())
    })

class BookPagination(PageNumberPagination):
    page_size = 15

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'page_size': self.page_size,  
            'results': data,
        })

class BookListAPIView(generics.ListAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    pagination_class = BookPagination


class AuthorPagination(PageNumberPagination):
    page_size = 16

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'page_size': self.page_size,
            'results': data,
        })

class AuthorListApiView(generics.ListAPIView):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    pagination_class = AuthorPagination

class BookDetailApiView(generics.RetrieveAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer

class AuthorDetailApiView(generics.RetrieveAPIView):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer


@method_decorator(csrf_exempt, name="dispatch")
class PasswordResetAPIView(PasswordResetView):
    def get(self, request, *args, **kwargs):
        return JsonResponse({"error": "GET not allowed"}, status=405)
    def form_valid(self, form):
        form.save(request=self.request, domain_override="127.0.0.1:8000", use_https="False")
        return JsonResponse({"status": "ok"})
    def form_invalid(self, form):
        return JsonResponse({"error": "Invalid email"}, status=400)



UserModel = get_user_model()

@method_decorator(csrf_exempt, name="dispatch")
class PasswordResetConfirmAPIView(View):
    def post(self, request, uidb64, token):
        # decode user
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = UserModel.objects.get(pk=uid)
        except Exception as e:
            print("UID decode failed:", e)
            return JsonResponse({"error": "Invalid link."}, status=400)

        # validate token
        if not default_token_generator.check_token(user, token):
            print("Token invalid for user", user.username)
            return JsonResponse({"error": "Invalid or expired token."}, status=400)
      
        # validate passwords
        form = SetPasswordForm(user, request.POST)
        if not form.is_valid():
            return JsonResponse(form.errors, status=400)

        form.save()
        return JsonResponse({"status": "ok"})

    def get(self, *args, **kwargs):
        # block GET completely
        return JsonResponse({"error": "GET not allowed"}, status=405)


class MyBorrowedBooksAPIView(generics.ListAPIView):
    serializer_class = BookSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = BookPagination
    def get_queryset(self):
        user = self.request.user
        return Book.objects.filter(bookinstance__borrower=user).distinct()


class GenreListAPIView(generics.ListAPIView):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer


class LanguageListAPIView(generics.ListAPIView):
    queryset = Language.objects.all()
    serializer_class = LanguageSerializer

class CreateBookAPIView(generics.CreateAPIView):
    queryset = Book.objects.all()
    serializer_class = BookCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        user = self.request.user
        if not user.has_perm("catalog.add_book"):
            raise PermissionDenied("You do no have permission to add books.")

        serializer.save()

    
class CreateAuthorAPIView(generics.CreateAPIView):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]


    def perform_create(self, serializer):
        user = self.request.user
        if not user.has_perm("catalog.add_author"):
            raise PermissionDenied("You do no have permission to add books.")

        first_name = serializer.validated_data.get("first_name")
        last_name = serializer.validated_data.get("last_name")
        date_of_birth = serializer.validated_data.get("date_of_birth")
        date_of_death = serializer.validated_data.get("date_of_death")

        exists = Author.objects.filter(
            first_name__iexact=first_name.strip(),
            last_name__iexact=last_name.strip(),
            date_of_birth=date_of_birth,
            date_of_death=date_of_death,
        ).exists()
        
        if exists:
            raise serializers.ValidationError(
                {"detail": "An author with the same name and date of birth and death already exists."}
            )
        
        serializer.save()

    
class DeleteBookAPIView(APIView):

    permission_classes = [permissions.IsAuthenticated]  

    def post(self, request, pk):
        user = request.user
        if not user.has_perm("catalog.delete_book"):
            return Response(
                {"detail": "Permission denied."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            book = Book.objects.get(pk=pk)
            book.delete()
            return Response(
                {"detail": "Book deleted successfully."},
                status=status.HTTP_200_OK
            )
        except Book.DoesNotExist:
            return Response(
                {"detail": "Book not found."},
                status=status.HTTP_404_NOT_FOUND
            )



class DeleteAuthorAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]  
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        user = request.user
        if not user.has_perm("catalog.delete_author"):
            return Response(
                {"detail": "Permission denied."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            author = Author.objects.get(pk=pk)
            author.delete()
            return Response(
                {"detail": "Author deleted successfully."},
                status=status.HTTP_200_OK
            )
        except RestrictedError:
            return Response({"detail": "Cannot delete this author - they are associated with one or more books."},
                status=status.HTTP_400_BAD_REQUEST)
        except Author.DoesNotExist:
            return Response(
                {"detail": "Author not found."},
                status=status.HTTP_404_NOT_FOUND
            )


class EditBookAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]


    def post(self, request, pk):
        try:
            book = Book.objects.get(pk=pk)
        except Book.DoesNotExist:
            return Response({"detail": "Book not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = BookEditSerializer(book, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
             # handle genres manually
            genres = request.data.getlist("genre")
            if genres:
                book.genre.set(genres)

            # handle language manually (for safety)
            language = request.data.get("language")
            if language:
                book.language_id = language
                book.save()

            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegistrationAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        username = request.data.get("username")
        password = request.data.get("password")

        errors = {}

        if not username or not password or not email:
            return Response(
                {"detail": "Username, password, and email are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username=username).exists():
            errors["username"] = ["Username already exists."]

        try:
            validate_email(email)
        except ValidationError as e:
            errors["email"] = list(e)

        try:
            validate_password(password)
        except ValidationError as e:
            errors["password"] = list(e)

        if len(username) < 4:
            errors.setdefault("username", []).append("Username must be at least 4 characters long.")
        if " " in username:
            errors.setdefault("username", []).append("Username cannot contain spaces.")

        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(email=email, username=username, password=password)

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
        return Response({"detail": "User created successfully."}, status=status.HTTP_201_CREATED)
