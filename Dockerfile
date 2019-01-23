# The codebuild dockerfile

FROM debian:stretch-slim

RUN mkdir /build
WORKDIR /build
ADD requirements.txt .

ENV HUGO_VERSION='0.53' \
    HUGO_SHA256='0e4424c90ce5c7a0c0f7ad24a558dd0c2f1500256023f6e3c0004f57a20ee119'

RUN apt-get update && \
    apt-get install -y git curl python3-pip && \
    curl -Ls https://github.com/spf13/hugo/releases/download/v${HUGO_VERSION}/hugo_${HUGO_VERSION}_Linux-64bit.tar.gz -o /tmp/hugo.tar.gz && \
    echo "${HUGO_SHA256}  /tmp/hugo.tar.gz" | sha256sum -c - && \
    mkdir /tmp/hugo_${HUGO_VERSION} && \
    tar xf /tmp/hugo.tar.gz -C /tmp/hugo_${HUGO_VERSION} && \
    mv /tmp/hugo_${HUGO_VERSION}/hugo /usr/bin/hugo && \
    rm -rf /tmp/hugo* && \
    pip3 install -r requirements.txt
