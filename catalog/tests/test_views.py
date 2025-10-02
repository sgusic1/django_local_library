from django.test import TestCase
from django.urls import reverse
import datetime
from django.utils import timezone
from catalog.models import Author, BookInstance, Book, Genre, Language
from django.contrib.auth import get_user_model
import uuid
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType

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
        
class RenewBookInstancesViewTest(TestCase):
    def setUp(self):
        #add two users
        test_user1 = User.objects.create_user(username='testuser1', password='1X<ISRUkw+tuK')
        test_user2 = User.objects.create_user(username='testuser2', password='2HJ1vRV0Z&3iD')
        #add permission
        perm1 = Permission.objects.get(codename="can_renew")
        perm2 = Permission.objects.get(codename="can_see_all_borrowed_books")
        test_user2.user_permissions.add(perm1, perm2)

        #create a book
        test_author = Author.objects.create(first_name='Dominique', last_name='Rousseau')
        test_genre = Genre.objects.create(name='fantasy')
        test_language = Language.objects.create(name='English')
        test_book = Book.objects.create(
            title='Book Title',
            summary='My book summary',
            isbn='ABCDEFG',
            author=test_author,
            language=test_language,
        )
        test_book.genre.set([test_genre])

        #Create a bookinstance object for test_user_1
        return_date = datetime.date.today() + datetime.timedelta(days=5)
        self.test_bookinstance1 = BookInstance.objects.create(
            book = test_book,
            imprint='Unlikely Imprint, 2016',
            due_back=return_date,
            borrower=test_user1,
            status='o'
        )

        # Create a BookInstance object for test_user2
        return_date = datetime.date.today() + datetime.timedelta(days=5)
        self.test_bookinstance2 = BookInstance.objects.create(
            book=test_book,
            imprint='Unlikely Imprint, 2016',
            due_back=return_date,
            borrower=test_user2,
            status='o',
        )
        
    def test_redirect_if_not_logged_in(self):
        response = self.client.get(reverse('renew-book-librarian', kwargs={'pk': self.test_bookinstance1.pk}))

        self.assertEqual(response.status_code, 302)
        self.assertTrue(response.url.startswith('/accounts/login/'))

    def test_forbidden_if_logged_in_but_not_correct_permission(self):
        login = self.client.login(username='testuser1', password='1X<ISRUkw+tuK')
        self.assertTrue(login)
        response = self.client.get(reverse('renew-book-librarian', kwargs={'pk': self.test_bookinstance1.pk}))
        self.assertEqual(response.status_code, 403)
    
    def test_logged_in_with_permission_borrowed_book(self):
        login = self.client.login(username='testuser2', password='2HJ1vRV0Z&3iD')
        self.assertTrue(login)

        response = self.client.get(reverse('renew-book-librarian', kwargs={'pk': self.test_bookinstance2.pk}))
        self.assertEqual(response.status_code, 200)


    def test_logged_in_with_permission_another_users_borrowed_book(self):
        login = self.client.login(username='testuser2', password='2HJ1vRV0Z&3iD')
        self.assertTrue(login)

        response = self.client.get(reverse('renew-book-librarian', kwargs={'pk': self.test_bookinstance1.pk}))
        self.assertEqual(response.status_code, 200)

    def test_HTTP404_for_invalid_book_if_logged_in(self):
        test_uid = uuid.uuid4()
        login = self.client.login(username='testuser2', password='2HJ1vRV0Z&3iD')
        self.assertTrue(login)
        
        response = self.client.get(reverse('renew-book-librarian', kwargs={'pk': test_uid}))
        self.assertEqual(response.status_code, 404)

    def test_uses_correct_template(self):
        login = self.client.login(username='testuser2', password='2HJ1vRV0Z&3iD')
        self.assertTrue(login)
        
        response = self.client.get(reverse('renew-book-librarian', kwargs={'pk': self.test_bookinstance2.pk}))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'catalog/book_renew_librarian.html')

    def test_form_renewal_date_initially_has_date_three_weeks_in_future(self):
        login = self.client.login(username='testuser2', password='2HJ1vRV0Z&3iD')
        self.assertTrue(login)

        response = self.client.get(reverse('renew-book-librarian', kwargs={'pk': self.test_bookinstance2.pk}))
        self.assertEqual(response.status_code, 200)

        date_3_weeks_in_future = datetime.date.today() + datetime.timedelta(weeks=3)
        self.assertEqual(response.context['form'].initial['renewal_date'], date_3_weeks_in_future)

    def test_redirects_to_all_borrowed_book_list_on_success(self):
        login = self.client.login(username='testuser2', password='2HJ1vRV0Z&3iD')
        self.assertTrue(login)

        valid_date_in_future = datetime.date.today() + datetime.timedelta(weeks=2)
        response = self.client.post(reverse('renew-book-librarian', kwargs={'pk': self.test_bookinstance2.pk}), {'renewal_date': valid_date_in_future})
        self.assertRedirects(response, reverse('all-borrowed'))

    def test_form_invalid_renewal_date_past(self):
        login = self.client.login(username='testuser2', password='2HJ1vRV0Z&3iD')
        self.assertTrue(login)    
        
        date_in_past = datetime.date.today() - datetime.timedelta(weeks=2)
        response = self.client.post(reverse('renew-book-librarian', kwargs={'pk': self.test_bookinstance2.pk}), {'renewal_date': date_in_past})
        self.assertEqual(response.status_code, 200)
        self.assertFormError(response.context['form'], 'renewal_date', 'Invalid date - renewal in past')

    def test_form_invalid_renewal_date_future(self):
        login = self.client.login(username='testuser2', password='2HJ1vRV0Z&3iD')
        self.assertTrue(login)

        date_in_future = datetime.date.today() + datetime.timedelta(weeks=5)
        response = self.client.post(reverse('renew-book-librarian', kwargs={'pk': self.test_bookinstance2.pk}), {'renewal_date': date_in_future})
        self.assertEqual(response.status_code, 200)
        self.assertFormError(response.context['form'], 'renewal_date', 'Invalid date - renewal more than 4 weeks ahead')
    
class AuthorCreateViewTest(TestCase):
    def setUp(self):
        test_user = User.objects.create_user(username='testuser', password='password')
        test_user_no_perm = User.objects.create_user(username='testusernp', password='pass1')
        
        content_typeAuthor = ContentType.objects.get_for_model(Author)
        perm = Permission.objects.get(codename='add_author', content_type= content_typeAuthor)
        test_user.user_permissions.add(perm)

    def test_redirect_if_not_logged_in(self):
        response = self.client.get(reverse('author-create'))

        self.assertEqual(response.status_code, 302)
        self.assertTrue(response.url.startswith('/accounts/login/'))

    def test_forbidden_if_logged_in_but_not_correct_permission(self):
        login = self.client.login(username='testusernp', password='pass1')
        self.assertTrue(login)

        response = self.client.get(reverse('author-create'))
        self.assertEqual(response.status_code, 403)

    def test_logged_in_with_permission(self):
        login = self.client.login(username='testuser', password='password')
        self.assertTrue(login)

        response = self.client.get(reverse('author-create'))
        self.assertEqual(response.status_code, 200)

    def test_logged_in_uses_correct_template(self):
        login = self.client.login(username='testuser', password='password')
        self.assertTrue(login)

        response = self.client.get(reverse('author-create'))
        self.assertTemplateUsed(response, 'catalog/author_form.html')

    def test_redirects_to_created_author_on_success(self):
        login = self.client.login(username='testuser', password='password')
        self.assertTrue(login)

        response = self.client.post(
            reverse('author-create'), 
            {
                'first_name': 'Ana', 
                'last_name': 'Biibi', 
                'date_of_birth': '1900-05-12', 
                'date_of_death': ''
            }
        )

        author = Author.objects.get(first_name='Ana', last_name='Biibi')
        self.assertRedirects(response, reverse('author-detail', args=[author.id]))





    




