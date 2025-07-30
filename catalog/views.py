import datetime

from django.shortcuts import render, get_object_or_404
from .models import Book, Author, BookInstance, Genre
from django.views import generic
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.mixins import PermissionRequiredMixin
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.contrib.auth.decorators import login_required, permission_required

from catalog.forms import RenewBookForm

def index(request):
    """View fucntion for home page of site."""


    #Generate counts of some of the main objects
    num_books = Book.objects.all().count()
    num_instances = BookInstance.objects.all().count()


    #Available books (status = 'a')
    num_instances_available = BookInstance.objects.filter(status__exact = 'a').count()

    #The 'all()' is implied by default.
    num_authors = Author.objects.count()

    #Number of visits to this view, as counted in the session variable
    num_visits = request.session.get('num_visits', 0)
    cookies_accepted = request.COOKIES.get('cookies_accepted')
    print(num_visits)
    if cookies_accepted is None: 
        request.session.set_test_cookie()
    elif cookies_accepted == "true":
        if not request.session.test_cookie_worked() and num_visits == 0:
            request.session.set_test_cookie()
        else: 
            num_visits += 1
            request.session['num_visits'] = num_visits
        


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
        'keyword': keyword,
        'num_visits': num_visits
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


class LoanedBooksByUserListView(LoginRequiredMixin, generic.ListView):
    """Generic class-based view listing books on loan to current user."""
    model = BookInstance
    template_name = 'catalog/bookinstance_list_borrowed_user.html'
    paginate_by = 10

    def get_queryset(self):
        return(BookInstance.objects.filter(borrower=self.request.user).filter(status='o').order_by('due_back'))
    


class AllBorrowedBooksListView(PermissionRequiredMixin, generic.ListView):
    """Generic class-based view listing of all borrowed books"""
    permission_required = "catalog.can_see_all_borrowed_books"
    model = BookInstance
    template_name = 'catalog/bookinstance_list_all_borrowed.html'
    paginate_by = 10

    def get_queryset(self):
        return(BookInstance.objects.filter(status='o').order_by('due_back'))


@login_required
@permission_required('catalog.can_renew', raise_exception=True)
def renew_book_librarian(request, pk):
    book_instance = get_object_or_404(BookInstance, pk=pk)

    #If it's a POST request then proccess the form data
    if request.method == 'POST':

        #Create a form instance and populate it with data from the request (binding)
        form = RenewBookForm(request.POST)

        #If form valid
        if form.is_valid():
            book_instance.due_back = form.cleaned_data['renewal_date']
            book_instance.save()
        
            #redirection to new url 
            return HttpResponseRedirect(reverse('all-borrowed'))

    else:
        proposal_renewal_date = datetime.date.today() + datetime.timedelta(weeks=3)
        form = RenewBookForm(initial={'renewal_date':proposal_renewal_date})
        
    context = {
        'form': form,
        'book_instance': book_instance,
    }

    return render(request, 'catalog/book_renew_librarian.html', context)