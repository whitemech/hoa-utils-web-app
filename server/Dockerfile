FROM python:3.8-alpine

EXPOSE 5000

RUN mkdir /build
WORKDIR /build
COPY . /build

RUN pip3 install .
RUN pip3 install gunicorn

CMD gunicorn --bind 0.0.0.0:$PORT wsgi
