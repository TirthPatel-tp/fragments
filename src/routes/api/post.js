const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  logger.debug('Received POST request to create a new fragment.');

  logger.debug('Request body: ' + JSON.stringify(req.body));

  if (!Buffer.isBuffer(req.body)) {
    logger.error('Unsupported Media Type: Request body is not a buffer');
    return res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));
  }

  try {
    const fragment = new Fragment({ ownerId: req.user, type: req.get('Content-Type') });
    await fragment.save();
    await fragment.setData(req.body);

    logger.debug('New fragment created: ' + JSON.stringify(fragment));

    res.set('Content-Type', fragment.type);
    res.set('Location', `${process.env.API_URL}/v1/fragments/${fragment.id}`);
    res.status(201).json(
      createSuccessResponse({
        fragment: fragment,
      })
    );
  } catch (err) {
    logger.error('Error occurred while processing request:', err);
    res.status(500).json(createErrorResponse(500, err.message));
  }
};
