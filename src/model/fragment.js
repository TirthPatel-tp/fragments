// src/model/fragment.js

const { randomUUID } = require('crypto');
const contentType = require('content-type');
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');
const logger = require('pino')();

class Fragment {
  constructor({
    id = randomUUID(),
    ownerId = '',
    created = new Date().toISOString(),
    updated = new Date().toISOString(),
    type = '',
    size = 0,
  }) {
    try {
      if (!ownerId || !type) {
        throw new Error('ownerId and type are required');
      }

      if (!Fragment.isSupportedType(type)) {
        throw new Error('Invalid fragment type');
      }

      if (typeof size !== 'number' || size < 0) {
        throw new Error('size must be a non-negative number');
      }

      this.id = id;
      this.ownerId = ownerId;
      this.created = created;
      this.updated = updated;
      this.type = type;
      this.size = size;

      logger.debug('Fragment created', { id: this.id, ownerId: this.ownerId });
    } catch (error) {
      logger.error('Error creating fragment', { error: error.message });
      throw error;
    }
  }

  static async byUser(ownerId, expand = false) {
    try {
      const fragments = await listFragments(ownerId, expand);
      if (expand) {
        return fragments.map((fragment) => new Fragment(fragment));
      }
      return fragments;
    } catch (err) {
      logger.error('Error fetching fragments by user', { ownerId, error: err.message });
      return [];
    }
  }

  static async byId(ownerId, id) {
    try {
      return new Fragment(await readFragment(ownerId, id));
    } catch (error) {
      logger.error('Error fetching fragment by ID', { ownerId, id, error: error.message });
      throw new Error('unable to find fragment by that id');
    }
  }

  static async delete(ownerId, id) {
    try {
      await deleteFragment(ownerId, id);
      logger.info('Fragment deleted successfully', { ownerId, id });
    } catch (error) {
      logger.error('Error deleting fragment', { ownerId, id, error: error.message });
      throw error;
    }
  }

  async save() {
    try {
      this.updated = new Date().toISOString();
      await writeFragment(this);
      logger.debug('Fragment saved successfully', { id: this.id, ownerId: this.ownerId });
    } catch (error) {
      logger.error('Error saving fragment', {
        id: this.id,
        ownerId: this.ownerId,
        error: error.message,
      });
      throw error;
    }
  }

  async getData() {
    try {
      const data = await readFragmentData(this.ownerId, this.id);
      logger.debug('Fragment data fetched successfully', { id: this.id, ownerId: this.ownerId });
      return Buffer.from(data);
    } catch (error) {
      logger.error('Error getting fragment data', {
        id: this.id,
        ownerId: this.ownerId,
        error: error.message,
      });
      throw new Error('unable to get data');
    }
  }

  async setData(data) {
    try {
      if (!data) {
        throw new Error();
      } else {
        this.updated = new Date().toISOString();
        this.size = Buffer.byteLength(data);
        await writeFragment(this);
        await writeFragmentData(this.ownerId, this.id, data);
        logger.debug('Fragment data set successfully', { id: this.id, ownerId: this.ownerId });
      }
    } catch (error) {
      logger.error('Error setting fragment data', {
        id: this.id,
        ownerId: this.ownerId,
        error: error.message,
      });
      throw error;
    }
  }

  get isText() {
    try {
      const { type } = contentType.parse(this.type);
      return type.startsWith('text/');
    } catch (error) {
      logger.error('Error getting fragment text type', {
        id: this.id,
        ownerId: this.ownerId,
        error: error.message,
      });
      return false;
    }
  }

  get formats() {
    try {
      return [this.mimeType];
    } catch (error) {
      logger.error('Error getting fragment formats', {
        id: this.id,
        ownerId: this.ownerId,
        error: error.message,
      });
      return [];
    }
  }

  static isSupportedType(value) {
    try {
      const { type } = contentType.parse(value);
      return validTypes.includes(type);
    } catch (error) {
      logger.error('Error checking fragment supported type', { value, error: error.message });
      return false;
    }
  }

  get mimeType() {
    try {
      const { type } = contentType.parse(this.type);
      return type;
    } catch (error) {
      logger.error('Error getting fragment MIME type', {
        id: this.id,
        ownerId: this.ownerId,
        error: error.message,
      });
      return '';
    }
  }
}

const validTypes = ['text/plain'];

module.exports.Fragment = Fragment;
