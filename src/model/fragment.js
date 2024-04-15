// src/model/fragment.js

const { randomUUID } = require('crypto');
const contentType = require('content-type');
const md = require('markdown-it')();
const mime = require('mime-types');
const sharp = require('sharp');
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
    if (!ownerId || !type) {
      throw new Error('ownerId and type are required');
    }

    if (!Fragment.isSupportedType(type)) {
      throw new Error('Invalid fragment type');
    }

    this.id = id;
    this.ownerId = ownerId;
    this.created = created;
    this.updated = updated;
    this.type = type;
    this.size = size;

    if (typeof size !== 'number' || size < 0) {
      throw new Error('size must be a non-negative number');
    }

    logger.debug('Fragment created', { id: this.id, ownerId: this.ownerId });
  }

  static async byUser(ownerId, expand = false) {
    const fragments = await listFragments(ownerId, expand);
    if (expand) {
      return fragments.map((fragment) => new Fragment(fragment));
    }
    return fragments;
  }

  static async byId(ownerId, id) {
    return new Fragment(await readFragment(ownerId, id));
  }

  static async delete(ownerId, id) {
    await deleteFragment(ownerId, id);
    logger.info('Fragment deleted successfully', { ownerId, id });
  }

  async save() {
    this.updated = new Date().toISOString();
    await writeFragment(this);
    logger.debug('Fragment saved successfully', { id: this.id, ownerId: this.ownerId });
  }

  async getData() {
    return await readFragmentData(this.ownerId, this.id).then((data) => Buffer.from(data));
  }

  async setData(data) {
    if (!data) {
      throw new Error();
    } else {
      this.updated = new Date().toISOString();
      this.size = Buffer.byteLength(data);
      await writeFragment(this);
      await writeFragmentData(this.ownerId, this.id, data);
      logger.debug('Fragment data set successfully', { id: this.id, ownerId: this.ownerId });
    }
  }

  get isText() {
    const { type } = contentType.parse(this.type);
    return type.startsWith('text/');
  }

  get formats() {
    if (this.mimeType === 'text/plain') {
      return ['text/plain'];
    } else if (this.mimeType === 'text/markdown') {
      return ['text/plain', 'text/markdown', 'text/html'];
    } else if (this.mimeType === 'text/html') {
      return ['text/plain', 'text/html'];
    } else if (this.mimeType === 'application/json') {
      return ['text/plain', 'application/json'];
    } else {
      return ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    }
  }

  static isSupportedType(value) {
    const { type } = contentType.parse(value);
    return validTypes.includes(type);
  }

  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  // static async convertType(data, extension) {
  //   let desiredType = mime.lookup(extension);
  //   const availableFormats = this.formats;
  //   if (!availableFormats.includes(desiredType)) {
  //     logger.warn("Can't convert to this type");
  //     return false;
  //   }
  //   let resultdata = data;
  //   if (this.mimeType !== desiredType) {
  //     if (this.mimeType === 'text/markdown' && desiredType === 'text/html') {
  //       resultdata = md.render(data.toString());
  //       resultdata = Buffer.from(resultdata);
  //     } else if (desiredType === 'image/jpeg') {
  //       resultdata = await sharp(data).jpeg().toBuffer();
  //     } else if (desiredType === 'image/png') {
  //       resultdata = await sharp(data).png().toBuffer();
  //     } else if (desiredType === 'image/webp') {
  //       resultdata = await sharp(data).webp().toBuffer();
  //     } else if (desiredType === 'image/gif') {
  //       resultdata = await sharp(data).gif().toBuffer();
  //     }
  //   }
  //   logger.debug('Fragment type converted successfully', { id: this.id, ownerId: this.ownerId });
  //   return { resultdata, convertedType: desiredType };
  // }
  static async convertType(data, extension) {
    // Create an instance of Fragment to access the formats property
    const fragmentInstance = new Fragment({ type: '' });

    let desiredType = mime.lookup(extension);
    const availableFormats = fragmentInstance.formats; // Access formats property using an instance

    if (!availableFormats.includes(desiredType)) {
      logger.warn("Can't convert to this type");
      return false;
    }
    let resultdata = data;
    if (this.mimeType !== desiredType) {
      if (this.mimeType === 'text/markdown' && desiredType === 'text/html') {
        resultdata = md.render(data.toString());
        resultdata = Buffer.from(resultdata);
      } else if (desiredType === 'image/jpeg') {
        resultdata = await sharp(data).jpeg().toBuffer();
      } else if (desiredType === 'image/png') {
        resultdata = await sharp(data).png().toBuffer();
      } else if (desiredType === 'image/webp') {
        resultdata = await sharp(data).webp().toBuffer();
      } else if (desiredType === 'image/gif') {
        resultdata = await sharp(data).gif().toBuffer();
      }
    }
    logger.debug('Fragment type converted successfully', { id: this.id, ownerId: this.ownerId });
    return { resultdata, convertedType: desiredType };
  }

  async textConvert(value) {
    var result, data;
    data = await this.getData();
    if (value == 'plain') {
      if (this.type == 'application/json') {
        result = JSON.parse(data);
      } else {
        result = data;
      }
    } else if (value == 'html') {
      if (this.type.endsWith('markdown')) {
        result = md.render(data.toString());
      }
    }
    return result;
  }

  async imgConvert(value) {
    var result, data;
    data = await this.getData();

    if (this.type.startsWith('image')) {
      if (value == 'jpg' || value == 'jpeg') {
        result = await sharp(data).jpeg();
      } else if (value == 'webp') {
        result = await sharp(data).webp();
      } else if (value == 'png') {
        result = await sharp(data).png();
      }
    }
    return result.toBuffer();
  }

  /**
   * Returns string of newly changed type name by changing extension
   * @param {string} value extension to be changed
   * @returns {string} changes type name
   */
  extConvert(value) {
    var ext;
    if (value == 'txt') {
      ext = 'plain';
    } else if (value == 'md') {
      ext = 'markdown';
    } else if (value == 'jpg') {
      ext = 'jpeg';
    } else {
      ext = value;
    }
    return ext;
  }
}

const validTypes = [
  'text/plain',
  'text/markdown',
  'text/html',
  'application/json',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
];

module.exports.Fragment = Fragment;
