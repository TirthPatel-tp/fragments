################################################################
#Stage 1: Install the base dependencies
################################################################
# Use node version 20.11.0
FROM node:20.11.0@sha256:f3299f16246c71ab8b304d6745bb4059fa9283e8d025972e28436a9f9b36ed24 AS base

LABEL maintainer="Tirth Patel <tpatel103@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Set the NODE_ENV to production
ENV NODE_ENV=production

# Use /app as our working directory
WORKDIR /app

# Copy the package.json and package-lock.json files into /app
COPY package*.json /app/

# Install node dependencies as defined in the package-lock.json
RUN npm ci --only=production

################################################################
#Stage 2: Build and Serve the application
################################################################
FROM node:20.11.0@sha256:f3299f16246c71ab8b304d6745bb4059fa9283e8d025972e28436a9f9b36ed24 AS build

#Set the working directory
WORKDIR /app

#Copy the generated node_modules from the previous stage
COPY --from=base /app/ /app/

# Copy src to /app/src/
COPY ./src ./src

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

# Added healthcheck
HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget -qO- "http://localhost:8080/" || exit 1

# Start the container by running our server
CMD ["npm","start"]

# We run our service on port 8080
EXPOSE 8080
