import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { setupTestApp } from './utils/setupTestApp';

describe('HealthController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await setupTestApp();
  }, 15000);

  afterAll(async () => {
    await app.close();
  }, 15000);

  it('GET /health - should return 200 OK when database is connected', async () => {
    const response = await request(app.getHttpServer()).get('/health').expect(200);

    expect(response.body).toEqual({ message: 'OK' });
  }, 10000);
});
