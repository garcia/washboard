from django.db import models
from django.contrib.auth.models import User
from south.modelsinspector import add_introspection_rules

# From http://stackoverflow.com/questions/2350681

class LowerCaseCharField(models.fields.CharField):

    def pre_save(self, model_instance, add):
        current_value = getattr(model_instance, self.attname)
        setattr(model_instance, self.attname, current_value.lower())
        return getattr(model_instance, self.attname)

    def to_python(self, value):
        value = super(LowerCaseCharField, self).to_python(value)
        if isinstance(value, basestring):
            return value.lower()
        return value

add_introspection_rules([], ['^wb\.models\.LowerCaseCharField'])

# From http://stackoverflow.com/questions/44109/965883

class UserProfile(models.Model):
    user = models.OneToOneField(User)
    infinite_scrolling = models.BooleanField(default=True)
    sessions = models.BooleanField(default=False)
    safe_mode = models.BooleanField(default=False)

def create_user_profile(sender, instance, created, **kwargs):
    if created:
        profile, created = UserProfile.objects.get_or_create(user=instance)

models.signals.post_save.connect(create_user_profile, sender=User)


class Rule(models.Model):
    user = models.ForeignKey(User)
    keyword = LowerCaseCharField(max_length=128)
    blacklist = models.BooleanField(default=True)
    show_notification = models.BooleanField(default=True)
    whole_word = models.BooleanField(default=False)
    regex = models.BooleanField(default=False)
    index = models.IntegerField()

    class Meta:
        unique_together = ('user', 'keyword')


class WhitelistUser(models.Model):
    user = models.ForeignKey(User)
    other_user = models.TextField(max_length=64)

class HiddenPost(models.Model):
    user = models.ForeignKey(User)
    post = models.URLField()
    show_notification = models.BooleanField(default=True)
