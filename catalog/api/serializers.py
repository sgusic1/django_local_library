from rest_framework import serializers
from catalog.models import Book, Author, Genre, Language, BookInstance
import datetime
        
class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = "__all__"

class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = "__all__"


class BookInstanceSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    class Meta:
        model = BookInstance
        fields = ["id", "imprint", "status", "status_display", "due_back"]

class ShortBookSerializer(serializers.ModelSerializer):
    genre = GenreSerializer(many=True)
    language = LanguageSerializer()
    class Meta:
        model = Book
        fields = ["id","title", "genre", "language", "cover_image"]


class AuthorSerializer(serializers.ModelSerializer):
    books = ShortBookSerializer(source="book_set", many=True, read_only=True)
    class Meta:
        model = Author
        fields = "__all__"


    def validate_date_of_birth(self, value):
        if value and value > datetime.date.today():
            raise serializers.ValidationError("Birth date cannot be in the future.")
        return value

    def validate_date_of_death(self, value):
        if value and value > datetime.date.today():
            raise serializers.ValidationError("Death date cannot be in the future.")
        return value
    
    def validate(self, data):
        errors = {}

        if not data.get("first_name"):
            errors["first_name"] = "Missing first name."

        if not data.get("date_of_birth"):
            errors["date_of_birth"] = "You must select a date of birth."

        date_of_birth = data.get("date_of_birth")
        date_of_death = data.get("date_of_death")

        if date_of_birth and date_of_death and date_of_death < date_of_birth:
            errors["date_of_death"] = "Death date cannot be earlier than birth date."
    

        if errors:
            raise serializers.ValidationError(errors)

        return data

    

    
class BookSerializer(serializers.ModelSerializer):
    instances = BookInstanceSerializer(source="bookinstance_set", many=True, read_only=True)
    
    author = AuthorSerializer()
    genre = GenreSerializer(many=True)
    language = LanguageSerializer()
    class Meta:
        model = Book
        fields = "__all__"

    def update(self, instance, validated_data):
        genres = validated_data.pop("genre", None)
        instance = super().update(instance, validated_data)
        if genres is not None:
            intstance.genre.set(genres)
        return instance

class BookCreateSerializer(serializers.ModelSerializer):
    author = serializers.PrimaryKeyRelatedField(queryset=Author.objects.all())
    genre = serializers.PrimaryKeyRelatedField(queryset=Genre.objects.all(), many=True)
    language = serializers.PrimaryKeyRelatedField(queryset=Language.objects.all())

    class Meta:
        model = Book
        fields = [
            "id",
            "title",
            "author",
            "summary",
            "isbn",
            "genre",
            "language",
            "cover_image",
        ]

    def validate_isbn(self, value):
        if len(value) not in (10, 13):
            raise serializers.ValidationError("ISBN must be either 10 or 13 characters long.")
        return value

    def validate(self, data):
        errors = {}

        if not data.get("author"):
            errors["author"] = "You must select an author."

        if not data.get("genre"):
            errors["genre"] = "At least one genre must be selected."

        if not data.get("language"):
            errors["language"] = "You must select a language."

        if not data.get("cover_image"):
            errors["cover_image"] = "You must upload a book cover image."

        title = data.get("title", "").strip()
        author = data.get("author")
        summary = data.get("summary", "").strip()
        isbn = data.get("isbn", "").strip()

        if Book.objects.filter(
            title__iexact=title,
            author=author,
            summary__iexact=summary,
            isbn__iexact=isbn,
        ).exists():
            raise serializers.ValidationError({
                "detail": "A book with the same title, author, isbn and summary already exists."
            })
        if Book.objects.filter(
            isbn__iexact=isbn,
        ).exists():
            raise serializers.ValidationError({
                "detail": "A book with the same isbn already exists."
            })

        if errors:
            raise serializers.ValidationError(errors)

        return data

class BookEditSerializer(serializers.ModelSerializer):
    author = serializers.PrimaryKeyRelatedField(queryset=Author.objects.all())
    genre = serializers.PrimaryKeyRelatedField(queryset=Genre.objects.all(), many=True)
    language = serializers.PrimaryKeyRelatedField(queryset=Language.objects.all())

    class Meta:
        model = Book
        fields = [
            "id",
            "title",
            "author",
            "summary",
            "isbn",
            "genre",
            "language",
            "cover_image",
        ]

    def validate_isbn(self, value):
        if len(value) not in (10, 13):
            raise serializers.ValidationError("ISBN must be either 10 or 13 characters long.")
        return value

    def validate(self, data):
        errors = {}

        if not data.get("author"):
            errors["author"] = "You must select an author."

        if not data.get("genre"):
            errors["genre"] = "At least one genre must be selected."

        if not data.get("language"):
            errors["language"] = "You must select a language."

        if errors:
            raise serializers.ValidationError(errors)

        return data




