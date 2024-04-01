// src/routes/index.js

const express = require('express');
const { hostname } = require('os');
const { createSuccessResponse } = require('../response');
// version and author from package.json
const { version } = require('../../package.json');

// Create a router that we can use to mount our API
const router = express.Router();

// Our authentication middleware
const { authenticate } = require('../auth');

/**
 * Expose all of our API routes on /v1/* to include an API version.
 * Protect them all with middleware so you have to be authenticated
 * in order to access things.
 */
router.use(`/v1`, authenticate(), require('./api'));

/**
 * Expose all of our API routes on /v1/* to include an API version.
 */
// router.use(`/v1`, require('./api'));

/**
 * Define a simple health check route. If the server is running
 * we'll respond with a 200 OK.  If not, the server isn't healthy.
 */
router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json(
    createSuccessResponse({
      // TODO: make sure these are changed for your name and repo
      author: 'Tirth Patel',
      githubUrl: 'https://github.com/TirthPatel-tp/fragments.git',
      version,
      // Include the hostname in the response
      hostname: hostname(),
    })
  );
});

module.exports = router;
