# Fragmnet is a backend folder which operates all the api and allow frontend to access db 


# Use node version 20.6.1
FROM node:20.6.1

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

# Use /app as our working directory
WORKDIR /app

# Option 3: explicit filenames - Copy the package.json and package-lock.json
# files into the working dir (/app), using full paths and multiple source
# files.  All of the files will be copied into the working dir `./app`
COPY package.json package-lock.json ./

# Install node dependencies defined in package-lock.json
RUN npm install

# Copy src to /app/src/
COPY ./src ./src

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

# Start the container by running our server
CMD npm start

# We run our service on port 8080
EXPOSE 8080


# Stage 0: Install alpine Linux + node + yarn + dependencies
FROM node:18-alpine3.17@sha256:1ce036f42d26834b04aacf766b112afca03430a2 AS dependencies

ENV NODE_ENV=production

WORKDIR /app

# copy dep files and install the production deps
COPY package.json yarn.lock ./
RUN yarn

#######################################################################

# Stage 1: use dependencies to build the site
FROM node:18-alpine3.17@sha256:1ce036f42d26834b04aacf766b112afca03430a2 AS builder

WORKDIR /app
# Copy cached dependencies from previous stage so we don't have to download
COPY --from=dependencies /app /app
# Copy source code into the image
COPY . .
# Build the site to build/
RUN yarn build

########################################################################

# Stage 2: nginx web server to host the built site
FROM nginx:stable-alpine@sha256:1ce036f42d26834b04aacf766b112afca03430a2 AS deploy

# Put our build/ into /usr/share/nginx/html/ and host static files
COPY --from=builder /app/build/ /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl --fail localhost:80 || exit 1
