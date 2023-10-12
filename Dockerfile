FROM ghcr.io/puppeteer/puppeteer:latest

USER root

RUN apt-get update && \
    apt-get install ffmpeg -y

WORKDIR /usr/src/record
COPY package.json index.js /usr/src/record/
RUN npm install
COPY ./app/ /usr/src/record/app/

CMD ["node", "app/index.js"]
