const validateKey = (key) => typeof key === 'string';
const logger = require('../../../logger');

class MemoryDB {
  constructor() {
    /** @type {Record<string, any>} */
    this.db = {};
  }

  /**
   * Gets a value for the given primaryKey and secondaryKey
   * @param {string} primaryKey
   * @param {string} secondaryKey
   * @returns {Promise<any>}
   */
  get(primaryKey, secondaryKey) {
    if (!(validateKey(primaryKey) && validateKey(secondaryKey))) {
      const errorMessage = `primaryKey and secondaryKey strings are required, got primaryKey=${primaryKey}, secondaryKey=${secondaryKey}`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const db = this.db;
    const value = db[primaryKey] && db[primaryKey][secondaryKey];
    return Promise.resolve(value);
  }

  /**
   * Puts a value into the given primaryKey and secondaryKey
   * @param {string} primaryKey
   * @param {string} secondaryKey
   * @returns {Promise<void>}
   */
  put(primaryKey, secondaryKey, value) {
    if (!(validateKey(primaryKey) && validateKey(secondaryKey))) {
      const errorMessage = `primaryKey and secondaryKey strings are required, got primaryKey=${primaryKey}, secondaryKey=${secondaryKey}`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const db = this.db;
    // Make sure the `primaryKey` exists, or create
    db[primaryKey] = db[primaryKey] || {};
    // Add the `value` to the `secondaryKey`
    db[primaryKey][secondaryKey] = value;
    return Promise.resolve();
  }

  /**
   * Queries the list of values (i.e., secondaryKeys) for the given primaryKey.
   * Always returns an Array, even if no items are found.
   * @param {string} primaryKey
   * @returns {Promise<any[]>}
   */
  query(primaryKey) {
    if (!validateKey(primaryKey)) {
      const errorMessage = `primaryKey string is required, got primaryKey=${primaryKey}`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    // No matter what, we always return an array (even if empty)
    const db = this.db;
    const values = db[primaryKey] ? Object.values(db[primaryKey]) : [];
    return Promise.resolve(values);
  }

  /**
   * Deletes the value with the given primaryKey and secondaryKey
   * @param {string} primaryKey
   * @param {string} secondaryKey
   * @returns {Promise<void>}
   */
  async del(primaryKey, secondaryKey) {
    if (!(validateKey(primaryKey) && validateKey(secondaryKey))) {
      const errorMessage = `primaryKey and secondaryKey strings are required, got primaryKey=${primaryKey}, secondaryKey=${secondaryKey}`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    // Throw if trying to delete a key that doesn't exist
    if (!(await this.get(primaryKey, secondaryKey))) {
      const errorMessage = `missing entry for primaryKey=${primaryKey} and secondaryKey=${secondaryKey}`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const db = this.db;
    delete db[primaryKey][secondaryKey];
    return Promise.resolve();
  }
}

module.exports = MemoryDB;
