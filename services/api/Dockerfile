FROM node:16.19.0-bullseye-slim
# Should run the container as node user, rather than as root(will this conflict with puppeteer?)
WORKDIR /usr/src/app
COPY . .

ARG CONFIGURATION_ENV
ARG FINICITY_CALLBACK_URL

RUN npm install
RUN npm install typescript -g
RUN tsc -b

EXPOSE 8080

CMD ["node", "./"]