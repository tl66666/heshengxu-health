import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const document = {
  openapi: '3.0.0',
  info: { title: '禾伴健康 API', version: 'v1' },
  servers: [{ url: '/api/v1' }],
  components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer' } } },
  paths: {
    '/health': {
      get: { responses: { '200': { description: '服务健康' } } },
    },
    '/health-profiles/me': {
      get: {
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: '当前用户健康档案' }, '401': { description: '未认证' } },
      },
    },
  },
};

await writeFile(resolve(process.cwd(), 'openapi.json'), `${JSON.stringify(document, null, 2)}\n`);
