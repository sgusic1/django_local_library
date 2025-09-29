from django.test import TestCase
from django.urls import reverse
import datetime
from django.utils import timezone
from catalog.models import Author, BookInstance, Book, Genre, Language
from django.contrib.auth import get_user_model

User = get_user_model()

class AuthorListViewTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        #13 authors for pagination test
        number_of_authors = 13

        for author_id in range(number_of_authors):
            Author.objects.create(
                first_name=f'Dominique {author_id}',
                last_name=f'Surname {author_id}' 
            )

    def test_view_url_exists_at_desired_location(self):
        response = self.client.get('/catalog/authors/')

        self.assertEqual(response.status_code, 200)

    def test_view_url_accessible_by_name(self):
        response = self.client.get(reverse('authors'))

        self.assertEqual(response.status_code, 200)
        
    def test_view_uses_correct_template(self):
        response = self.client.get(reverse('authors'))

        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'catalog/author_list.html')

    def test_pagination_is_ten(self):
        response = self.client.get(reverse('authors'))

        self.assertEqual(response.status_code, 200)
        self.assertTrue('is_paginated' in response.context)
        self.assertTrue(response.context['is_paginated'] is True)
        self.assertEqual(len(response.context['author_list']), 10)

    def test_lists_all_authors(self):
        #checks the remaining 3 authors
        response = self.client.get(f"{reverse('authors')}?page=2")

        self.assertEqual(response.status_code, 200)
        self.assertTrue('is_paginated' in response.context)
        self.assertTrue(response.context['is_paginated'] is True)
        self.assertEqual(len(response.context['author_list']), 3)

class LoanedBookInstancesByUserListViewTest(TestCase):
    def setUp(self):
        test_user1 = User.objects.create_user(username='testuser1', password='1X<ISRUkw+tuK')
        test_user2 = User.objects.create_user(username='testuser2', password='2HJ1vRV0Z&3iD')

        #create a book
        test_author = Author.objects.create(first_name="Dominique", last_name="Rousseau")
        test_genre = Genre.objects.create(name="Fantasy")
        test_language = Language.objects.create(name="English")
        test_book = Book.objects.create(
            title='Book Title',
            summary='My book summary',
            isbn='ABCDEFG',
            author=test_author,
            language=test_language,
        )
        test_book.genre.set([test_genre])

        #Creating 30 bookinstance objects
        number_of_book_copies = 30
        for book_copy in range(number_of_book_copies):
            return_date = timezone.localtime() + datetime.timedelta(days=book_copy%5)
            the_borrower = test_user1 if book_copy%2 else test_user2
            status = 'm'
            BookInstance.objects.create(
                book=test_book,
                imprint='Unlikely Imprint, 2016',
                due_back=return_date,
                borrower=the_borrower,
                status=status,
            )


    def test_redirect_if_not_logged_in(self):
        response = self.client.get(reverse('my-borrowed'))

        self.assertRedirects(response, '/accounts/login/?next=/catalog/mybooks/')
        

    def test_logged_in_uses_correct_template(self):
        self.client.login(username='testuser1', password='1X<ISRUkw+tuK')
        response = self.client.get(reverse('my-borrowed'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(str(response.context['user']), 'testuser1')
        self.assertTemplateUsed(response, 'catalog/bookinstance_list_borrowed_user.html')

    def test_only_borrowed_books_in_list(self):
        self.client.login(username='testuser1', password='1X<ISRUkw+tuK')
        response = self.client.get(reverse('my-borrowed'))

        #check if respone is ok
        self.assertEqual(response.status_code, 200)
        #check if user is logged in
        self.assertEqual(str(response.context['user']), 'testuser1')
        #check if bookinstance list exists 
        self.assertTrue('bookinstance_list' in response.context)
        self.assertEqual(len(response.context['bookinstance_list']), 0)

        #change first 10 books to be on loan
        books = BookInstance.objects.all()[:10]
        for book in books:
            book.status = 'o'
            book.save()
        
        response = self.client.get(reverse('my-borrowed'))

        #check if respone is ok
        self.assertEqual(response.status_code, 200)
        #check if user is logged in
        self.assertEqual(str(response.context['user']), 'testuser1')
        self.assertTrue('bookinstance_list' in response.context)

        for book_item in response.context['bookinstance_list']:
            self.assertEqual(book_item.borrower, response.context['user'])
            self.assertEqual(book_item.status, 'o')

    def test_pages_ordered_by_due_date(self):
        for book in BookInstance.objects.all():
            book.status = 'o'
            book.save() 
        
        self.client.login(username='testuser1', password='1X<ISRUkw+tuK')
        response = self.client.get(reverse('my-borrowed'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(str(response.context['user']), 'testuser1')

        self.assertEqual(len(response.context['bookinstance_list']), 10)

        last_date = None
        for book in response.context['bookinstance_list']:
            if last_date is not None:
                self.assertLessEqual(last_date, book.due_back)
            last_date = book.due_back
        