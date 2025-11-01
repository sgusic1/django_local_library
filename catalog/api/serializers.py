from rest_framework import serializers
from catalog.models import Book, Author, Genre, Language, BookInstance

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = "__all__"
        
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

    
    
class BookSerializer(serializers.ModelSerializer):
    instances = BookInstanceSerializer(source="bookinstance_set", many=True, read_only=True)

    author = AuthorSerializer()
    genre = GenreSerializer(many=True)
    language = LanguageSerializer()
    class Meta:
        model = Book
        fields = "__all__"


