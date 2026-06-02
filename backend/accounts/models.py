from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        OWNER = "OWNER", "Chủ đại lý"
        STAFF = "STAFF", "Nhân viên"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.OWNER,
    )
    phone = models.CharField(max_length=20, blank=True)
    agency_name = models.CharField(max_length=255, blank=True)
    agency_address = models.TextField(blank=True)

    def __str__(self):
        return self.username