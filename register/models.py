from django.db import models
from django.contrib.auth.models import User

# Much of this is copied from http://stackoverflow.com/a/965883/392143

class UserProfile(models.Model):
    user = models.OneToOneField(User)
    api_key = models.TextField(max_length=64)
    api_secret = models.TextField(max_length=64)
    token_key = models.TextField(max_length=64)
    token_secret = models.TextField(max_length=64)

def create_user_profile(sender, instance, created, **kwargs):
    if created:
        profile, created = UserProfile.objects.get_or_create(user=instance)

models.signals.post_save.connect(create_user_profile, sender=User)


class Blacklist(models.Model):
    text = models.TextField(max_length=128)
    user = models.ForeignKey(User)


class TemporaryKeypair(models.Model):
    api_key = models.TextField(max_length=64)
    api_secret = models.TextField(max_length=64)
    nonce = models.TextField(max_length=64)
