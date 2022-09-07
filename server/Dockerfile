FROM node:15.7

COPY . /

RUN yarn
COPY ./.env /

CMD ["/bin/bash", "-c", "yarn dev"]

EXPOSE 3001
