FROM node:15.7

COPY . /

RUN yarn
COPY ./src/config.json /src

CMD ["/bin/bash", "-c", "yarn start && yarn compile:sass"]

EXPOSE 3000
