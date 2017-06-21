FROM python:2.7-onbuild

EXPOSE 8000

RUN apt-get update \
    && apt-get install -y --no-install-recommends mysql-client node-less \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app
COPY requirements.txt ./
RUN pip install -r requirements.txt
COPY . .

CMD ["gunicorn_django", "-b", "0.0.0.0:8000", "-k", "eventlet"]
