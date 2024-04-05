const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  try {
    logger.debug(
      `Received request to get metadata for fragment. Owner ID: ${req.user}, Fragment ID: ${req.params.id}`
    );

    logger.debug('Fetching fragment metadata from the database...');
    const fragment = await Fragment.byId(req.user, req.params.id);

    logger.debug('Fragment metadata retrieved successfully');
    if (!fragment) {
      logger.warn('Fragment not found');
      return res.status(404).json(createErrorResponse(404, 'There is no fragment with this id'));
    }

    logger.debug('Sending fragment metadata in response');
    res.status(200).json(
      createSuccessResponse({
        fragment: fragment,
      })
    );
  } catch (e) {
    logger.error(`Error occurred while getting fragment metadata: ${e.message}`);
    res.status(500).json(createErrorResponse(500, e.message));
  }
};
