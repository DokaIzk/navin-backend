import request from 'supertest';
import { buildApp } from '../src/app.js';

describe('ETag support (Issue #80)', () => {
  const app = buildApp();

  it('first request returns 200 with an ETag header', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.headers['etag']).toBeDefined();
  });

  it('subsequent request with matching If-None-Match returns 304 Not Modified', async () => {
    const first = await request(app).get('/api/health');
    const etag = first.headers['etag'] as string;

    const second = await request(app).get('/api/health').set('If-None-Match', etag);

    expect(second.status).toBe(304);
  });
});
