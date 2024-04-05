const path = require('path');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  logger.debug(
    `Received request to get fragment by id. Owner ID: ${req.user}, Fragment ID: ${req.params.id}`
  );

  try {
    logger.debug('Fetching fragment from the database...');
    const fragment = await Fragment.byId(req.user, req.params.id.split('.')[0]);
    logger.debug(`Fragment found: ${JSON.stringify(fragment)}`);

    logger.debug('Fetching data for the fragment...');
    const data = await fragment.getData();
    logger.debug('Data retrieved successfully');

    const extension = path.extname(req.params.id);
    logger.debug(`Extension of the requested file: ${extension}`);

    if (extension) {
      logger.debug('Extension detected. Attempting conversion...');
      const { resultdata, convertedType } = await fragment.convertType(data, extension);

      if (!resultdata) {
        logger.warn('Fragment cannot be converted to this type or the extension is invalid');
        return res
          .status(415)
          .json(
            createErrorResponse(
              415,
              'Fragment cant be converted to this type or extension is invalid'
            )
          );
      }

      logger.debug(`Fragment converted successfully. Converted type: ${convertedType}`);
      res.set('Content-Type', convertedType);
      res.status(200).send(resultdata);
    } else {
      logger.debug('No extension detected. Sending data without conversion...');
      logger.debug(`Fragment type: ${fragment.type}`);
      res.set('Content-Type', fragment.type);
      res.status(200).send(data);
    }
  } catch (e) {
    logger.error(`Error occurred while getting fragment by id: ${e.message}`);
    res.status(404).json(createErrorResponse(404, 'No fragment found with this id'));
  }
};
