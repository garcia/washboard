from django.core.management.base import BaseCommand, CommandError
from django.contrib.sessions.models import Session
from django.contrib.auth.models import User

class Command(BaseCommand):
    args = '<session_key>'
    help = 'Gets the username attached to a given session_key'
    
    def handle(self, session_key, **options):
        session = Session.objects.get(session_key__startswith=session_key)
        user_id = session.get_decoded()['_auth_user_id']
        user = User.objects.get(id__exact=user_id)
        self.stdout.write(user.username)
