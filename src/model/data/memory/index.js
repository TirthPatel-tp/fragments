// src/model/data/memory/index.js

const MemoryDB = require('./memory-db');
const logger = require('../../../logger');

// Create two in-memory databases: one for fragment metadata and the other for raw data
const data = new MemoryDB();
const metadata = new MemoryDB();

// Write a fragment's metadata to memory db. Returns a Promise
function writeFragment(fragment) {
  try {
    return metadata.put(fragment.ownerId, fragment.id, fragment);
  } catch (error) {
    logger.error('Error writing fragment metadata to memory db', { error: error.message });
    throw error;
  }
}

// Read a fragment's metadata from memory db. Returns a Promise
function readFragment(ownerId, id) {
  try {
    return metadata.get(ownerId, id);
  } catch (error) {
    logger.error('Error reading fragment metadata from memory db', {
      ownerId,
      id,
      error: error.message,
    });
    throw error;
  }
}

// Write a fragment's data buffer to memory db. Returns a Promise
function writeFragmentData(ownerId, id, buffer) {
  try {
    return data.put(ownerId, id, buffer);
  } catch (error) {
    logger.error('Error writing fragment data to memory db', { ownerId, id, error: error.message });
    throw error;
  }
}

// Read a fragment's data from memory db. Returns a Promise
function readFragmentData(ownerId, id) {
  try {
    return data.get(ownerId, id);
  } catch (error) {
    logger.error('Error reading fragment data from memory db', {
      ownerId,
      id,
      error: error.message,
    });
    throw error;
  }
}

// Get a list of fragment ids/objects for the given user from memory db. Returns a Promise
async function listFragments(ownerId, expand = false) {
  try {
    const fragments = await metadata.query(ownerId);

    // If we don't get anything back, or are supposed to give expanded fragments, return
    if (expand || !fragments) {
      return fragments;
    }

    // Otherwise, map to only send back the ids
    return fragments.map((fragment) => fragment.id);
  } catch (error) {
    logger.error('Error listing fragments from memory db', { ownerId, error: error.message });
    return [];
  }
}

// Delete a fragment's metadata and data from memory db. Returns a Promise
async function deleteFragment(ownerId, id) {
  try {
    // Delete metadata
    await metadata.del(ownerId, id);
    // Delete data
    await data.del(ownerId, id);
    logger.debug('Fragment metadata and data deleted successfully from memory db', { ownerId, id });
  } catch (error) {
    logger.error('Error deleting fragment metadata and data from memory db', {
      ownerId,
      id,
      error: error.message,
    });
    throw error;
  }
}

module.exports.listFragments = listFragments;
module.exports.writeFragment = writeFragment;
module.exports.readFragment = readFragment;
module.exports.writeFragmentData = writeFragmentData;
module.exports.readFragmentData = readFragmentData;
module.exports.deleteFragment = deleteFragment;
