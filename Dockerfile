FROM node:10-alpine

WORKDIR /var/www

COPY ./src /var/www/src
COPY ./package.json /var/www/package.json
COPY ./package-lock.json /var/www/package-lock.json

RUN npm install

