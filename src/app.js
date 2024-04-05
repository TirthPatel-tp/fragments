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

// Set up Passport authentication middleware
passport.use(authenticate.strategy());
app.use(passport.initialize());

// Use pino logging middleware
app.use(pino);

// Use helmetjs security middleware
app.use(helmet());

// Use CORS middleware to handle cross-origin requests
app.use(cors());

// Use gzip/deflate compression middleware
app.use(compression());

// Define routes
app.use('/', require('./routes'));

// Handle requests for resources that can't be found (404)
app.use((req, res) => {
  const errorResponse = createErrorResponse(404, 'not found');
  res.status(404).json(errorResponse);
});

// Error-handling middleware for any other errors
app.use((err, req, res) => {
  const status = err.status || 500;
  const message = err.message || 'unable to process request';

  // Log server errors for debugging
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

// Export the Express app
module.exports = app;
