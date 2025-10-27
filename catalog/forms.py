import datetime

from django import forms

from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit
from .models import Author, Genre, Language, Book
import re


class RenewBookForm(forms.Form):
    renewal_date = forms.DateField(help_text="Enter a date between now and 4 weeks (default 3).")
    def clean_renewal_date(self):
        data = self.cleaned_data['renewal_date']

        #Check if a date is not in the past.
        if data < datetime.date.today():
            raise ValidationError(_('Invalid date - renewal in past'))

    #Check if a date is in the allowed range (+4 weeks from today).
        if data > datetime.date.today() + datetime.timedelta(weeks=4):
            raise ValidationError(_('Invalid date - renewal more than 4 weeks ahead'))

        return data


class BookCreateForm(forms.ModelForm):
    """Form class for creating and updating a Book record"""
    class Meta:
        model = Book
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_method = "post"
        self.helper.add_input(Submit('submit', 'Submit'))

    def clean_title(self):
        title_data = self.cleaned_data['title']
        if not title_data:
            raise ValidationError("Tittle cannot be empty!")
        
        return title_data

    def clean_isbn(self):
        isbn_data = self.cleaned_data['isbn'].replace("-", "").strip()
        if not re.fullmatch(r"\d{13}", isbn_data):
            raise ValidationError("ISBN must be exactly 13 digits (numbers only).")
        
        #check if valid isbn
        check = (10 - (sum(int(d) * (1 if i % 2 == 0 else 3) for i, d in enumerate(isbn_data[:-1])) % 10 )) % 10
        if check != int(isbn_data[-1]):
            raise ValidationError("Invalid ISBN.")

        book_with_isbn = Book.objects.filter(isbn = isbn_data)
        if self.instance and self.instance.pk:
            book_with_isbn = book_with_isbn.exclude(pk=self.instance.pk)
        if book_with_isbn.exists():
            raise ValidationError("A book with this ISBN already exists.")

        return isbn_data

    def clean(self):
        data = super().clean()
        genres = data.get("genre")
        if not genres or len(genres) == 0:
            self.add_error("genre", "Select at least one genre.")
        return data 
