const request = require('supertest');
const app = require('../../src/app');

describe('POST /v1/fragments', () => {
  test('unauthenticated requests are denied', () => request(app).post('/v1/fragments').expect(401));
  test('incorrect credentials are denied', () =>
    request(app).post('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));
  test('authenticated users create a plain text fragment, response include expected properties', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('aa');
    const body = JSON.parse(res.text);
    expect(res.statusCode).toBe(201);
    expect(body.status).toBe('ok');
    expect(body.fragment.type).toMatch(/text\/plain+/);
    expect(Object.keys(body.fragment)).toEqual([
      'id',
      'ownerId',
      'created',
      'updated',
      'type',
      'size',
    ]);
    expect(body.fragment.size).toEqual(2);
  });

  //responses include a Location header with a URL to GET the fragment
  test('response include a Location header with a URL to GET the fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is fragment');
    expect(res.statusCode).toBe(201);
    expect(res.headers.location).toEqual(
      `${process.env.API_URL}/v1/fragments/${JSON.parse(res.text).fragment.id}`
    );
  });

  //trying to create a fragment with an unsupported type errors as expected
  test('get unsupported type error', () =>
    request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'audio/mp4')
      .auth('user1@email.com', 'password1')
      .send('aa')
      .expect(415));
});
