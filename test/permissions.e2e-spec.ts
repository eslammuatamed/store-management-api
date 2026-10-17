import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';

import { AppModule } from './../src/app.module.js';
describe('Permissions (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  it('GET /api/permissions should return permissions', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/permissions')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.statusCode).toBe(200);
    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'permissions.read',
          scopePolicy: 'global_only',
        }),
        expect.objectContaining({
          code: 'roles.read',
          scopePolicy: 'global_only',
        }),
      ]),
    );
  });

  afterAll(async () => {
    await app.close();
  });
});
