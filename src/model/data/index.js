// src/model/data/index.js

// You can extend this to select the appropriate data strategy based on environment/configurations
// For now, we only have the memory strategy
module.exports = process.env.AWS_REGION ? require('./aws') : require('./memory');
