const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  logger.debug('Received GET request to retrieve fragments.');
  logger.debug('Request query parameters: ' + JSON.stringify(req.query));

  let expand = req.query.expand === '1';

  try {
    const fragments = await Fragment.byUser(req.user, expand);
    logger.debug('Fragments retrieved successfully.');
    res.status(200).json(
      createSuccessResponse({
        fragments: fragments,
      })
    );
  } catch (e) {
    logger.error('Error retrieving fragments:', e.message);
    res.status(500).json(createErrorResponse(500, e.message));
  }
};
