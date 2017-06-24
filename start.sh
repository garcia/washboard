#!/bin/sh
python manage.py syncdb --all
python manage.py migrate --fake

gunicorn_django -b 0.0.0.0:8000 -k eventlet
