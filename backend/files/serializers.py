from rest_framework import serializers
from .models import File

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['file']

class FileListSerializer(serializers.ModelSerializer):
    file_name = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = ['id','file','file_name']

    def get_file_name(self, obj):
        # Example: just return the file name without path
        return obj.file.name.split('/')[-1]