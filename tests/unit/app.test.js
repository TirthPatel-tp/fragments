// tests/unit/app.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('App 404 Handler', () => {
  test('should return a 404 error for non-existing routes', async () => {
    const res = await request(app).get('/non-existing-route');

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      status: 'error',
      error: {
        message: 'not found',
        code: 404,
      },
    });
  });
});
