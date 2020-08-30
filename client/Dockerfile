FROM ubuntu:20.04

USER root

ENV DEBIAN_FRONTEND=noninteractive 

RUN apt-get update && \
    apt-get install -y dialog && \
    apt-get install -y apt-utils && \
    apt-get upgrade -y && \
    apt-get install -y sudo

# helper tools
RUN apt-get install -y curl && \
    apt-get install -y gnupg

# install yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
RUN apt update && apt install -y yarn

EXPOSE 3000

RUN mkdir /build
WORKDIR /build
COPY . /build

RUN yarn install
RUN yarn build
CMD yarn run serve -s build -l $PORT
