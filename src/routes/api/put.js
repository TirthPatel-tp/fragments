// src/routes/api/put.js

const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  logger.debug('Test PUT: ' + req.body);

  if (!Buffer.isBuffer(req.body)) {
    return res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));
  }
  const id = req.params.id.split('.')[0];
  try {
    const fragId = await Fragment.byId(req.user, id);
    if (!fragId) {
      return res
        .status(404)
        .json(createErrorResponse(404, 'There is no fragment exist with this id'));
    }
    if (fragId.type !== req.get('Content-Type')) {
      return res
        .status(400)
        .json(
          createErrorResponse(400, "No match between the fragment's type and the request's type")
        );
    }
    const fragment = new Fragment({
      ownerId: req.user,
      id: id,
      created: fragId.created,
      type: req.get('Content-Type'),
    });
    await fragment.save();
    await fragment.setData(req.body);

    logger.debug('A new fragment has been created with this type: ' + JSON.stringify(fragment));

    res.set('Content-Type', fragment.type);
    res.set('Location', `${process.env.API_URL}/v1/fragments/${fragment.id}`);
    res.status(201).json(
      createSuccessResponse({
        fragment: fragment,
      })
    );
  } catch (err) {
    res.status(500).json(createErrorResponse(500, err.message));
  }
};
