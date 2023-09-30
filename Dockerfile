FROM node:16-alpine3.16 as build

# Set to a non-root built-in user `node`
USER node
# Create app directory (with user `node`)
RUN mkdir -p /home/node/app
WORKDIR /home/node/app

COPY --chown=node package*.json ./

RUN npm install
# Bundle app source code
COPY --chown=node . .

RUN npm run build

#artifact
FROM node:16-alpine3.16 as artifact

USER node
RUN mkdir -p /home/node/app
WORKDIR /home/node/app

COPY --from=build --chown=node /home/node/app/dist /home/node/app/dist
COPY --from=build --chown=node /home/node/app/node_modules /home/node/app/node_modules

# Bind to all network interfaces so that it can be mapped to the host OS
ENV HOST=0.0.0.0 PORT=3000

EXPOSE ${PORT}
CMD ["node", "-r", "source-map-support/register", "/home/node/app/dist/main"]
