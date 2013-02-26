from django.db import models
from django.contrib.auth.models import User

class Rule(models.Model):
    user = models.ForeignKey(User)
    keyword = models.TextField(max_length=256)
    blacklist = models.BooleanField(default=True)
    show_notification = models.BooleanField(default=True)
    show_user = models.BooleanField(default=True)
    show_keyword = models.BooleanField(default=True)
    scan_tags = models.BooleanField(default=True)
    scan_post = models.BooleanField(default=True)
    regex = models.BooleanField(default=False)

class WhitelistUser(models.Model):
    user = models.ForeignKey(User)
    other_user = models.TextField(max_length=64)
