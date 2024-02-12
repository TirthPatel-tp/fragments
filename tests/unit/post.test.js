// tests/unit/post.test.js

const request = require('supertest');
const express = require('express');
const app = express();
const postRoute = require('../../src/routes/api/post');
const { Fragment } = require('../../src/model/fragment');

app.use(express.json());
app.use('/', postRoute);

describe('POST /fragments', () => {
  test('creates a new fragment with valid data', async () => {
    const response = await request(app)
      .post('/fragments')
      .set('Content-Type', 'text/plain')
      .send('Hello, World!');

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('ownerId', 'exampleOwnerId');
    expect(response.body).toHaveProperty('created');
    expect(response.body).toHaveProperty('updated');
    expect(response.body).toHaveProperty('type', 'text/plain');
    expect(response.body).toHaveProperty('size', 13); // Length of 'Hello, World!'
    expect(response.header['location']).toMatch(
      new RegExp(`http://.*?/fragments/${response.body.id}`)
    );
  });

  test('returns 400 for invalid or empty buffer', async () => {
    const response = await request(app)
      .post('/fragments')
      .set('Content-Type', 'text/plain')
      .send('');

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('Invalid fragment data');
  });

  test('returns 400 for unsupported content type', async () => {
    const response = await request(app)
      .post('/fragments')
      .set('Content-Type', 'application/json')
      .send('{"key": "value"}');

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('Invalid fragment data');
  });

  test('returns 500 for internal server error', async () => {
    const mockFragmentSave = jest.spyOn(Fragment.prototype, 'save');
    mockFragmentSave.mockRejectedValue(new Error('Internal Server Error'));

    const response = await request(app)
      .post('/fragments')
      .set('Content-Type', 'text/plain')
      .send('Hello, World!');

    expect(response.statusCode).toBe(500);
    expect(response.text).toBe('Internal Server Error');
  });
});
