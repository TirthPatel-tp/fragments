// test/unit/get-metadata.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments/:id/info', () => {
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/randomid/info').expect(401));

  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments/randomid/info')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  test('authenticated users get fragment data with the given id', async () => {
    // Create a fragment
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is fragment');
    const id = JSON.parse(postRes.text).fragment.id;
    const fragment = JSON.parse(postRes.text).fragment;

    // Retrieve fragment data using the fragment ID
    const getRes = await request(app)
      .get(`/v1/fragments/${id}/info`)
      .auth('user1@email.com', 'password1');

    // Assert that the response status code is 200 and contains the expected fragment data
    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.status).toBe('ok');
    expect(getRes.body.fragment).toEqual(fragment);
  });

  test('no fragments with the given id returns 404 error', async () => {
    // Create a fragment
    await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is fragment');

    // Attempt to retrieve fragment data using a non-existing fragment ID
    const getRes = await request(app)
      .get('/v1/fragments/randomid/info')
      .auth('user1@email.com', 'password1');

    // Assert that the response status code is 500
    expect(getRes.statusCode).toBe(500);
  });
});
