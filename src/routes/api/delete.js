// src/routes/api/delete.js
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  const user = req.user;
  const id = req.params.id;
  try {
    await Fragment.delete(user, id);
    logger.debug(id, 'Fragment deleted');
    res.status(200).json(createSuccessResponse());
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error));
  }
};
