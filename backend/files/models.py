from django.db import models

# Create your models here.
class File(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    file = models.FileField(upload_to='uploads/')

    def __str__(self):
        return self.file.name