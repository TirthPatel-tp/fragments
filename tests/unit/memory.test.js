// tests/unit/memory.test.js

const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
} = require('../../src/model/data/memory/index');

describe('Memory DB Fragment Functions', () => {
  describe('writeFragment', () => {
    test('writes fragment metadata correctly', async () => {
      const fragment = { id: '1', ownerId: 'user1', type: 'text/plain', size: 10 };
      await writeFragment(fragment);
      const retrievedFragment = await readFragment('user1', '1');
      expect(retrievedFragment).toEqual(fragment);
    });

    test('handles missing fragment properties', async () => {
      const fragment = { id: '2', ownerId: 'user2' };
      await writeFragment(fragment);
      const retrievedFragment = await readFragment('user2', '2');
      expect(retrievedFragment).toEqual(fragment);
    });

    test('handles non-existent fragments', async () => {
      const nonExistentFragment = await readFragment('nonexistentuser', 'nonexistentid');
      expect(nonExistentFragment).toBe(undefined);
    });
  });

  describe('writeFragmentData', () => {
    test('writes fragment data correctly', async () => {
      const ownerId = 'user1';
      const id = '1';
      const data = Buffer.from('example data');
      await writeFragmentData(ownerId, id, data);
      const retrievedData = await readFragmentData(ownerId, id);
      expect(retrievedData).toEqual(data);
    });

    test('handles empty data', async () => {
      const ownerId = 'user1';
      const id = '2';
      const data = Buffer.alloc(0); // Empty buffer
      await writeFragmentData(ownerId, id, data);
      const retrievedData = await readFragmentData(ownerId, id);
      expect(retrievedData).toEqual(data);
    });

    test('handles non-existent data', async () => {
      const nonExistentData = await readFragmentData('nonexistentuser', 'nonexistentid');
      expect(nonExistentData).toBe(undefined);
    });
  });

  describe('readFragmentData', () => {
    test('reads fragment data correctly', async () => {
      const ownerId = 'user1';
      const id = '1';
      const data = Buffer.from('example data');
      await writeFragmentData(ownerId, id, data);
      const retrievedData = await readFragmentData(ownerId, id);
      expect(retrievedData).toEqual(data);
    });

    test('handles non-existent data', async () => {
      const nonExistentData = await readFragmentData('nonexistentuser', 'nonexistentid');
      expect(nonExistentData).toBe(undefined);
    });
  });

  describe('readFragment', () => {
    test('reads fragment metadata correctly', async () => {
      const fragment = { id: '1', ownerId: 'user1', type: 'text/plain', size: 10 };
      await writeFragment(fragment);
      const retrievedFragment = await readFragment('user1', '1');
      expect(retrievedFragment).toEqual(fragment);
    });

    test('handles non-existent fragments', async () => {
      const nonExistentFragment = await readFragment('nonexistentuser', 'nonexistentid');
      expect(nonExistentFragment).toBe(undefined);
    });
  });
});
