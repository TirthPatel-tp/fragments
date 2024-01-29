// src/routes/api/get.js

const { createSuccessResponse } = require('../../response');

module.exports = (req, res) => {
  // Use createSuccessResponse function for the response
  const fragmentsResponse = createSuccessResponse({
    status: 'ok',
    fragments: [],
  });

  res.status(200).json(fragmentsResponse);
};
