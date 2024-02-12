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
      return new Promise((resolve, reject) => {
        readFragmentData(this.ownerId, this.id)
          .then((data) => resolve(Buffer.from(data)))
          .catch(() => {
            reject(new Error());
          });
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
    return [this.mimeType];
  }

  static isSupportedType(value) {
    const { type } = contentType.parse(value);
    return validTypes.includes(type);
  }

  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }
}

const validTypes = ['text/plain'];

module.exports.Fragment = Fragment;
