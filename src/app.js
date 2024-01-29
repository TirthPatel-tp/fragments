// src/app.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const passport = require('passport');
const { createErrorResponse } = require('./response');
const authenticate = require('./auth/index');
const logger = require('./logger');
const pino = require('pino-http')({
  logger,
});

const app = express();

// Set up our passport authentication middleware
passport.use(authenticate.strategy());
app.use(passport.initialize());

// Use pino logging middleware
app.use(pino);

// Use helmetjs security middleware
app.use(helmet());

// Use CORS middleware so we can make requests across origins
app.use(cors());

// Use gzip/deflate compression middleware
app.use(compression());

// Define our routes
app.use('/', require('./routes'));

// Add 404 middleware to handle any requests for resources that can't be found
app.use((req, res) => {
  // Use createErrorResponse function for the response
  const errorResponse = createErrorResponse(404, 'not found');

  res.status(404).json(errorResponse);
});

// Add error-handling middleware to deal with anything else
app.use((err, req, res) => {
  // We may already have an error response we can use, but if not,
  // use a generic `500` server error and message.
  const status = err.status || 500;
  const message = err.message || 'unable to process request';

  // If this is a server error, log something so we can see what's going on.
  if (status > 499) {
    logger.error({ err }, `Error processing request`);
  }

  res.status(status).json({
    status: 'error',
    error: {
      message,
      code: status,
    },
  });
});

// Export our `app` so we can access it in server.js
module.exports = app;
