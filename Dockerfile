FROM python:2.7

EXPOSE 8000

RUN apt-get update \
    && apt-get install -y --no-install-recommends mysql-client node-less ca-certificates python-dev libnspr4-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app
COPY requirements.txt ./
RUN pip install -r requirements.txt
COPY . .

CMD ["./start.sh"]
