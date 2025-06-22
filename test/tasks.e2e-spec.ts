import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { setupTestApp } from './utils/setupTestApp';
import { TaskResponseDto } from '@/tasks/dto/taskResponse.dto';
import { AuthResponseDto } from '@/auth/dto/authResponse.dto';
import { FilteredTasksResponseDto } from '@/tasks/dto/filteredTaskResponse.dto';

describe('TasksController (e2e)', () => {
  let app: INestApplication<App>;
  let bearerToken: string;

  beforeAll(async () => {
    app = await setupTestApp();

    // get access token for authentication
    const userData = {
      email: 'tasksuser@nomail.com',
      name: 'tasksuser',
      password: 'TestPassword1',
      confirmPassword: 'TestPassword1',
    };

    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send(userData);

    bearerToken = `Bearer ${(registerRes.body as AuthResponseDto).accessToken}`;
  }, 15000);

  afterAll(async () => {
    await app.close();
  }, 15000);

  const taskData = {
    title: 'Test Task',
    description: 'This is a test task',
    status: 'IN_PROGRESS',
  };

  it('POST /tasks - should create a new task and return 201 Created', async () => {
    const response = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', bearerToken)
      .send(taskData)
      .expect(201);

    const body: TaskResponseDto = response.body as TaskResponseDto;

    expect(body).toHaveProperty('id');
    expect(body.title).toBe(taskData.title);
    expect(body.description).toBe(taskData.description);
    expect(body.status).toBe(taskData.status);
  }, 10000);

  it('GET /tasks - should return all tasks with 200 OK', async () => {
    const response = await request(app.getHttpServer())
      .get('/tasks')
      .set('Authorization', bearerToken)
      .expect(200);

    const body = response.body as FilteredTasksResponseDto;

    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(1);
    expect(body.data[0]).toHaveProperty('id');
    expect(body.data[0].title).toBe(taskData.title);
    expect(body.data[0].description).toBe(taskData.description);
    expect(body.data[0].status).toBe(taskData.status);
  }, 10000);

  it('GET /tasks - should return filtered tasks with 200 OK', async () => {
    await Promise.all(
      ['Task 1', 'Task 2', 'Task 3', 'Task 4'].map(async (title, i) => {
        const status = i % 2 === 0 ? 'TODO' : 'DONE';
        await request(app.getHttpServer())
          .post('/tasks')
          .set('Authorization', bearerToken)
          .send({ ...taskData, title, status })
          .expect(201);
      })
    );

    const todoResponse = await request(app.getHttpServer())
      .get('/tasks?status=TODO&offset=1&limit=10')
      .set('Authorization', bearerToken)
      .expect(200);

    const todoBody = todoResponse.body as FilteredTasksResponseDto;
    expect(Array.isArray(todoBody.data)).toBe(true);
    expect(todoBody.data.length).toBeGreaterThanOrEqual(1);
    expect(todoBody.data.every((task) => task.status === 'TODO')).toBe(true);

    const doneResponse = await request(app.getHttpServer())
      .get('/tasks?status=DONE&offset=1&limit=10')
      .set('Authorization', bearerToken)
      .expect(200);
    const doneBody = doneResponse.body as FilteredTasksResponseDto;
    expect(Array.isArray(doneBody.data)).toBe(true);
    expect(doneBody.data.length).toBeGreaterThanOrEqual(1);
    expect(doneBody.data.every((task) => task.status === 'DONE')).toBe(true);
  }, 10000);

  it('GET /tasks/:id - should return a specific task by ID with 200 OK', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', bearerToken)
      .send(taskData)
      .expect(201);

    const taskId = (createResponse.body as TaskResponseDto).id;

    const response = await request(app.getHttpServer())
      .get(`/tasks/${taskId}`)
      .set('Authorization', bearerToken)
      .expect(200);

    const body: TaskResponseDto = response.body as TaskResponseDto;

    expect(body.id).toBe(taskId);
    expect(body.title).toBe(taskData.title);
  }, 10000);

  it('PATCH /tasks/:id - should update a task and return 200 OK', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', bearerToken)
      .send(taskData)
      .expect(201);

    const taskId = (createResponse.body as TaskResponseDto).id;

    const updatedData = { ...taskData, title: 'Updated Task Title' };

    const response = await request(app.getHttpServer())
      .patch(`/tasks/${taskId}`)
      .set('Authorization', bearerToken)
      .send(updatedData)
      .expect(200);

    const body: TaskResponseDto = response.body as TaskResponseDto;

    expect(body.id).toBe(taskId);
    expect(body.title).toBe(updatedData.title);
  }, 10000);

  it('DELETE /tasks/:id - should delete a task and return 204 No Content', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', bearerToken)
      .send(taskData)
      .expect(201);

    const taskId = (createResponse.body as TaskResponseDto).id;

    await request(app.getHttpServer())
      .delete(`/tasks/${taskId}`)
      .set('Authorization', bearerToken)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/tasks/${taskId}`)
      .set('Authorization', bearerToken)
      .expect(404);
  }, 10000);
});
