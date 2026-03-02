import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { resolve } from 'node:path';
import { AppModule } from '../../src/app.module.js';

const exampleDir = resolve(import.meta.dirname, '../../../../examples/example1');

describe('OddsController (integration)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    process.env['MILLENNIUM_FALCON_CONFIG'] = resolve(exampleDir, 'millennium-falcon.json');

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health returns ok', async () => {
    // Act
    const result = await app.inject({ method: 'GET', url: '/api/health' });

    // Assert
    expect(result.statusCode).toBe(200);
    expect(result.json()).toEqual({ status: 'ok' });
  });

  it('POST /api/odds returns 0% for example 1 (countdown 7)', async () => {
    // Arrange
    const payload = {
      countdown: 7,
      bounty_hunters: [
        { planet: 'Hoth', day: 6 },
        { planet: 'Hoth', day: 7 },
        { planet: 'Hoth', day: 8 },
      ],
    };

    // Act
    const result = await app.inject({ method: 'POST', url: '/api/odds', payload });

    // Assert
    expect(result.statusCode).toBe(200);
    expect(result.json()).toEqual({ odds: 0 });
  });

  it('POST /api/odds returns 81% for example 2 (countdown 8)', async () => {
    // Arrange
    const payload = {
      countdown: 8,
      bounty_hunters: [
        { planet: 'Hoth', day: 6 },
        { planet: 'Hoth', day: 7 },
        { planet: 'Hoth', day: 8 },
      ],
    };

    // Act
    const result = await app.inject({ method: 'POST', url: '/api/odds', payload });

    // Assert
    expect(result.statusCode).toBe(200);
    expect(result.json().odds).toBeCloseTo(0.81, 10);
  });

  it('POST /api/odds returns 90% for example 3 (countdown 9)', async () => {
    // Arrange
    const payload = {
      countdown: 9,
      bounty_hunters: [
        { planet: 'Hoth', day: 6 },
        { planet: 'Hoth', day: 7 },
        { planet: 'Hoth', day: 8 },
      ],
    };

    // Act
    const result = await app.inject({ method: 'POST', url: '/api/odds', payload });

    // Assert
    expect(result.statusCode).toBe(200);
    expect(result.json().odds).toBeCloseTo(0.9, 10);
  });

  it('POST /api/odds returns 100% for example 4 (countdown 10)', async () => {
    // Arrange
    const payload = {
      countdown: 10,
      bounty_hunters: [
        { planet: 'Hoth', day: 6 },
        { planet: 'Hoth', day: 7 },
        { planet: 'Hoth', day: 8 },
      ],
    };

    // Act
    const result = await app.inject({ method: 'POST', url: '/api/odds', payload });

    // Assert
    expect(result.statusCode).toBe(200);
    expect(result.json().odds).toBe(1);
  });

  it('POST /api/odds validates payload and rejects invalid data', async () => {
    // Arrange
    const payload = { invalid: true };

    // Act
    const result = await app.inject({ method: 'POST', url: '/api/odds', payload });

    // Assert
    expect(result.statusCode).toBe(400);
  });

  it('POST /api/odds rejects when countdown is negative', async () => {
    // Arrange
    const payload = {
      countdown: -1,
      bounty_hunters: [],
    };

    // Act
    const result = await app.inject({ method: 'POST', url: '/api/odds', payload });

    // Assert
    expect(result.statusCode).toBe(400);
  });
});
