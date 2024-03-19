const { randomUUID } = require('crypto');
const contentType = require('content-type');
const md = require('markdown-it')();
var mime = require('mime-types');
const logger = require('../logger');

const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

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

    if (typeof this.size !== 'number' || this.size < 0) {
      throw new Error('size must be a non-negative number');
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
      return [];
    }
  }

  static async byId(ownerId, id) {
    try {
      return new Fragment(await readFragment(ownerId, id));
    } catch (error) {
      logger.error('unable to find fragment by that id');
      throw new Error('unable to find fragment by that id');
    }
  }

  static async delete(ownerId, id) {
    await deleteFragment(ownerId, id);
  }

  async save() {
    this.updated = new Date().toISOString();
    await writeFragment(this);
  }

  getData() {
    try {
      return readFragmentData(this.ownerId, this.id)
        .then((data) => Buffer.from(data))
        .catch(() => {
          throw new Error('unable to get data');
        });
    } catch (err) {
      throw new Error('unable to get data');
    }
  }

  async setData(data) {
    if (!data) {
      throw new Error();
    } else {
      this.updated = new Date().toISOString();
      this.size = Buffer.byteLength(data);
      await writeFragment(this);
      return await writeFragmentData(this.ownerId, this.id, data);
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
      return [this.mimeType];
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

  convertType(data, ext) {
    let desiredType = mime.lookup(ext);
    const availableFormats = this.formats;
    if (!availableFormats.includes(desiredType)) {
      logger.warn('Cant covert to this type');
      return false;
    }
    let resultdata = data;
    if (this.mimeType !== desiredType) {
      if (this.mimeType === 'text/markdown' && desiredType === 'text/html') {
        resultdata = md.render(data.toString());
        resultdata = Buffer.from(resultdata);
      }
    }
    return { resultdata, convertedType: desiredType };
  }
}

const validTypes = ['text/plain', 'text/markdown', 'text/html', 'application/json'];

module.exports.Fragment = Fragment;
