from django.shortcuts import render
from .models import Book, Author, BookInstance, Genre
from django.views import generic

def index(request):
    """View fucntion for home page of site."""


    #Generate counts of some of the main objects
    num_books = Book.objects.all().count()
    num_instances = BookInstance.objects.all().count()


    #Available books (status = 'a')
    num_instances_available = BookInstance.objects.filter(status__exact = 'a').count()

    #The 'all()' is implied by default.
    num_authors = Author.objects.count()



    #Books containing the keyword
    keyword = 'fantasy'
    num_books_keyword = Book.objects.all().filter(title__icontains=keyword).count()

    #Genres containing keyword
    num_genres_keyword = Genre.objects.filter(name__icontains=keyword).count()

    context = {
        'num_books': num_books,
        'num_instances': num_instances,
        'num_instances_available': num_instances_available,
        'num_authors': num_authors,  
        'num_books_keyword': num_books_keyword,
        'num_genres_keyword': num_genres_keyword,
        'keyword': keyword
    }

    #Render the HTML template index.html with the data in the context variable
    return render(request, 'index.html', context=context)


class BookListView(generic.ListView):
    model = Book
    paginate_by = 2

class BookDetailView(generic.DetailView):
    model = Book


class AuthorListView(generic.ListView):
    model = Author
    paginate_by = 5

class AuthorDetailView(generic.DetailView):
    model = Author

