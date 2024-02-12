// src/routes/api/post.js

const express = require('express');
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');
const logger = require('pino')();

const router = express.Router();

const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      const { type } = contentType.parse(req);
      return Fragment.isSupportedType(type);
    },
  });

router.post('/fragments', rawBody(), async (req, res) => {
  try {
    logger.debug('Received POST request to create fragment');
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      // Invalid or empty buffer
      logger.warn('Invalid or empty buffer received');
      return res.status(400).send('Invalid fragment data');
    }

    const { type } = contentType.parse(req);
    if (!Fragment.isSupportedType(type)) {
      logger.warn('Unsupported content type received');
      return res.status(400).send('Unsupported content type');
    }

    const fragment = new Fragment({
      ownerId: 'exampleOwnerId',
      type: type,
      size: req.body.length,
    });

    await fragment.setData(req.body);
    await fragment.save();

    const location = process.env.API_URL ? process.env.API_URL : `http://${req.headers.host}`;
    res.setHeader('Location', `${location}/fragments/${fragment.id}`);
    res.status(201).json({
      id: fragment.id,
      ownerId: fragment.ownerId,
      created: fragment.created,
      updated: fragment.updated,
      type: fragment.type,
      size: fragment.size,
    });
    logger.info('Fragment created successfully', { fragmentId: fragment.id });
  } catch (error) {
    logger.error('An error occurred while processing request', { error: error.message });
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
