FROM ubuntu:20.04

USER root

ENV DEBIAN_FRONTEND=noninteractive 
ENV LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH

RUN apt-get update && \
    apt-get install -y dialog && \
    apt-get install -y apt-utils && \
    apt-get upgrade -y && \
    apt-get install -y sudo

# other dependencies
RUN apt-get install -y python3 && \
    apt-get install -y python3-pip


# helper tools
RUN apt-get install -y curl && \
    apt-get install -y gnupg

# install yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
RUN apt update && apt install -y yarn

RUN pip3 install gunicorn

RUN mkdir /server
RUN mkdir /client
COPY ./server /server
COPY ./client /client

ARG REACT_APP_API_ENDPOINT=/api/
ARG REACT_APP_API_HOSTNAME=localhost

RUN cd /client && yarn install
RUN cd /client && yarn build

WORKDIR /server

RUN pip3 install .
CMD FLASK_STATIC_FOLDER=/client/build gunicorn --bind 0.0.0.0:$PORT wsgi
