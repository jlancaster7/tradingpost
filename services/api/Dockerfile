FROM node:16.19.0-bullseye-slim
#RUN apt-get update && apt-get install -y --no-install-recommends dumb-init
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Should run the container as node user, rather than as root(will this conflict with puppeteer?)

ARG CONFIGURATION_ENV
ARG FINICITY_CALLBACK_URL
ARG NPM_TOKEN

WORKDIR /usr/src/app
COPY . .

RUN npm install
RUN npm install typescript -g
RUN tsc -b

EXPOSE 8080

# Have dumb-init run Node process as PID 1
# CMD ["dumb-init", "node", "./"]
CMD ["node", "./"]