# Specify an initial image, a specific version of the Node.js image.
FROM node:20.17.0-bookworm-slim AS base

# Install dumb-init, a simple process supervisor and init system designed to
# run as PID 1 inside minimal container environments (such as Docker).
RUN true \
    && apt-get update \
    && apt-get install -y --no-install-recommends dumb-init \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create a working directory in the Docker image. The application will be
# placed here.
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json to the app directory. Do this
# separately from copying the rest of the app's code to leverage Docker's
# cache. As a result, the Docker image layer with installed dependencies is
# only rebuilt when these files change.
COPY package*.json /usr/src/app/

# Install the dependencies needed to run the application in production mode.
RUN npm ci --ignore-scripts --no-bin-links --omit=dev

# -----------------------------------------------------------------------------
# Final stage
# -----------------------------------------------------------------------------

# Specify a base image, a specific version of the Node.js image.
FROM node:20.17.0-bookworm-slim

# Copy the dumb-init binary from the production_dependencies image to the
# /usr/bin directory.
COPY --from=base /usr/bin/dumb-init /usr/bin/dumb-init

# Create a log directory for the application.
RUN true \
    && mkdir -p /var/log/data-server \
    && chown -R node:node /var/log/data-server

# Create a working directory in the Docker image. The application will be
# placed here.
WORKDIR /usr/src/app

# Copy the node_modules from the base stage, and the application from the
# host to the app directory.
COPY --from=base --chown=node:node /usr/src/app/node_modules /usr/src/app/node_modules
COPY --chown=node:node . /usr/src/app/

# Set the user that the Docker container runs as. In this case, it's set to
# 'node' to avoid running as root for security reasons.
USER node

# Expose the default port that the Express application listens on.
ARG PORT=3000
EXPOSE $PORT

# Set the NODE_ENV environment variable to production, and PORT to 3000 by
# default.
ENV NODE_ENV=production PORT=$PORT

# Define the command to run the Express application.
CMD ["dumb-init", "node", "./src/server.js"]
