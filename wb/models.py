from django.db import models
from django.contrib.auth.models import User

# Much of this is copied from
# http://stackoverflow.com/questions/44109/extending-the-user-model-with-custom-fields-in-django/965883

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


class TemporaryKeypair(models.Model):
    api_key = models.TextField(max_length=64)
    api_secret = models.TextField(max_length=64)
    token_key = models.TextField(max_length=64)
    token_secret = models.TextField(max_length=64)
    nonce = models.TextField(max_length=64)


class Rule(models.Model):
    user = models.ForeignKey(User)
    keyword = models.TextField(max_length=256)
    blacklist = models.BooleanField(default=True)
    show_notification = models.BooleanField(default=True)
    whole_word = models.BooleanField(default=False)
    regex = models.BooleanField(default=False)


class WhitelistUser(models.Model):
    user = models.ForeignKey(User)
    other_user = models.TextField(max_length=64)
