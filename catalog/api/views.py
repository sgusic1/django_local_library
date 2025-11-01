from django.http import JsonResponse
from catalog.models import Book, Author, BookInstance
from .serializers import BookSerializer, AuthorSerializer
from rest_framework import generics
from rest_framework.pagination import PageNumberPagination
from django.views.decorators.cache import cache_page
from rest_framework.response import Response


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

def loggedUser(request):
    
    data = {
        'is_authenticated': request.user.is_authenticated,
        'username': request.user.username if request.user.is_authenticated else None,
    }

    return JsonResponse(data)

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


    