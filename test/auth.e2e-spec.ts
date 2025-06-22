import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { setupTestApp } from './utils/setupTestApp';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await setupTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  const userData = {
    email: 'testuser@nomail.com',
    name: 'testuser',
    password: 'TestPassword1',
    confirmPassword: 'TestPassword1',
  };

  it('POST /auth/register - should return 201 Created with access token', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('expiresIn');
  }, 10000);

  it('POST /auth/register - should return 400 Bad Request for invalid input', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'invalidemail',
        name: '',
        password: 'short',
        confirmPassword: 'short',
      })
      .expect(400);
  }, 10000);

  it('POST /auth/register - should return 409 Conflict when email is already taken', async () => {
    await request(app.getHttpServer()).post('/auth/register').send(userData);

    await request(app.getHttpServer()).post('/auth/register').send(userData).expect(409);
  }, 10000);

  it('POST /auth/login - should return 200 OK with valid credentials', async () => {
    const newUserData = {
      ...userData,
      email: `${userData.email}m`,
    };

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: newUserData.email,
        name: newUserData.name,
        password: newUserData.password,
        confirmPassword: newUserData.confirmPassword,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: newUserData.email, password: newUserData.password })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('expiresIn');
  }, 10000);

  it('POST /auth/login - should return 401 Unauthorized with invalid credentials', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nouser@mail.com', password: 'DoesntExist1' })
      .expect(401);
  }, 10000);
});
