// src/model/data/index.js

// XXX: temporary use of memory-db until we add DynamoDB
const MemoryDB = require('../memory/memory-db');
const logger = require('../../../logger');
const s3Client = require('./s3Client');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

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

// Writes a fragment's data to an S3 Object in a Bucket
// https://github.com/awsdocs/aws-sdk-for-javascript-v3/blob/main/doc_source/s3-example-creating-buckets.md#upload-an-existing-object-to-an-amazon-s3-bucket
async function writeFragmentData(ownerId, id, data) {
  // Create the PUT API params from our details
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    // Our key will be a mix of the ownerID and fragment id, written as a path
    Key: `${ownerId}/${id}`,
    Body: data,
  };

  // Create a PUT Object command to send to S3
  const command = new PutObjectCommand(params);

  try {
    // Use our client to send the command
    await s3Client.send(command);
    logger.debug('Fragment data uploaded to S3 successfully', { ownerId, id });
  } catch (err) {
    // If anything goes wrong, log enough info that we can debug
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error uploading fragment data to S3');
    throw new Error('unable to upload fragment data');
  }
}

// Convert a stream of data into a Buffer, by collecting
// chunks of data until finished, then assembling them together.
// We wrap the whole thing in a Promise so it's easier to consume.
const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    // As the data streams in, we'll collect it into an array.
    const chunks = [];

    // Streams have events that we can listen for and run
    // code.  We need to know when new data is available,
    // if there's an error, and when we're at the end
    // of the stream.

    // When there's data, add the chunk to our chunks list
    stream.on('data', (chunk) => chunks.push(chunk));
    // When there's an error, reject the Promise
    stream.on('error', reject);
    // When the stream is done, resolve with a new Buffer of our chunks
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

// Reads a fragment's data from S3 and returns (Promise<Buffer>)
// https://github.com/awsdocs/aws-sdk-for-javascript-v3/blob/main/doc_source/s3-example-creating-buckets.md#getting-a-file-from-an-amazon-s3-bucket
async function readFragmentData(ownerId, id) {
  // Create the PUT API params from our details
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    // Our key will be a mix of the ownerID and fragment id, written as a path
    Key: `${ownerId}/${id}`,
  };

  // Create a GET Object command to send to S3
  const command = new GetObjectCommand(params);

  try {
    // Get the object from the Amazon S3 bucket. It is returned as a ReadableStream.
    const data = await s3Client.send(command);
    // Convert the ReadableStream to a Buffer
    const bufferData = await streamToBuffer(data.Body);
    logger.debug('Fragment data retrieved from S3 successfully', { ownerId, id });
    return bufferData;
  } catch (err) {
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error streaming fragment data from S3');
    throw new Error('unable to read fragment data');
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

async function deleteFragment(ownerId, id) {
  // Create the DELETE API params from our details
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    // Our key will be a mix of the ownerID and fragment id, written as a path
    Key: `${ownerId}/${id}`,
  };
  // Create a DELETE Object command to send to S3
  const command = new DeleteObjectCommand(params);
  // Delete data from S3 bucket
  try {
    // Use our client to send the command
    await s3Client.send(command);
    logger.info('Fragment data deleted from S3 successfully', { ownerId, id });
  } catch (err) {
    // If anything goes wrong, log enough info that we can debug
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error deleting fragment data from S3');
    throw new Error('unable to delete fragment data');
  }
}

module.exports.listFragments = listFragments;
module.exports.writeFragment = writeFragment;
module.exports.readFragment = readFragment;
module.exports.writeFragmentData = writeFragmentData;
module.exports.readFragmentData = readFragmentData;
module.exports.deleteFragment = deleteFragment;
