import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const document = {
  openapi: '3.0.0',
  info: { title: '和生序健康 API', version: 'v1' },
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
      put: {
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: {
          '200': { description: '保存当前用户健康档案' },
          '400': { description: '参数校验失败' },
          '401': { description: '未认证' },
        },
      },
    },
    '/health-records/weights': {
      post: protectedOperation('记录体重', '保存一条体重事实记录'),
    },
    '/health-records/weights/history': {
      get: protectedOperation('读取体重历史', '读取当前用户最近 120 条有效体重记录'),
    },
    '/health-records/meal-structures': {
      post: protectedOperation('记录饮食结构', '保存一餐的主食、蛋白质和蔬菜结构'),
    },
    '/health-records/activities': {
      post: protectedOperation('记录活动', '保存活动类型和时长'),
    },
    '/health-records/sleeps': {
      post: protectedOperation('记录睡眠', '保存睡眠时长和主观感受'),
    },
    '/health-records/{recordType}/{recordId}': {
      patch: protectedOperation('修改健康记录', '保留旧版本并创建新的当前记录'),
    },
    '/health-records/today': {
      get: protectedOperation('读取当天记录', '只返回当前版本的四类记录'),
    },
    '/health-plans/current': {
      get: protectedOperation('读取当前计划', '读取当前活跃计划和当天任务'),
      put: protectedOperation('设置当前计划', '归档旧计划并创建新的目标、计划和当天任务'),
    },
    '/health-plans/tasks/{taskId}': {
      patch: protectedOperation('完成计划任务', '完成或跳过当前用户的待办任务'),
    },
    '/daily-home/today': {
      get: protectedOperation('读取今日首页', '聚合档案、计划、记录进度和唯一行动'),
    },
    '/health-insights/weekly': {
      get: protectedOperation(
        'Weekly health review',
        'Aggregates only current, user-owned records for the requested week.',
      ),
    },
    '/food-recognition/consents': {
      post: protectedOperation(
        'Authorize food recognition',
        'Records explicit user authorization before a selected image can be sent to a recognition provider.',
      ),
    },
    '/food-recognition/uploads': {
      post: protectedOperation(
        'Create food recognition upload',
        'Creates an owned, expiring upload session and opaque object key for an authorized image.',
      ),
    },
    '/food-recognition/uploads/{uploadId}/complete': {
      post: protectedOperation(
        'Complete food recognition upload',
        'Marks only the owners non-expired upload session as ready for recognition.',
      ),
    },
    '/food-recognition/jobs': {
      post: protectedOperation(
        'Create food recognition job',
        'Creates candidate food suggestions only after explicit authorization.',
      ),
    },
    '/food-recognition/jobs/{jobId}': {
      get: protectedOperation(
        'Read food recognition job',
        'Returns only the current users recognition job and editable candidates.',
      ),
    },
    '/food-recognition/analyze': {
      post: protectedOperation(
        'Analyze a food image',
        'Sends an authorized image to the configured server-side vision provider and returns editable nutrition candidates without creating a meal entry.',
      ),
    },
    '/food-recognition/confirm': {
      post: protectedOperation(
        'Confirm food recognition candidate',
        'Creates a meal entry only after the user confirms a candidate and serving size.',
      ),
    },
    '/foods/search': {
      get: protectedOperation('搜索食品', '只返回启用的食品及其营养和可选份量'),
    },
    '/foods/{foodId}': {
      get: protectedOperation('读取食品详情', '读取单个启用食品的营养和份量'),
    },
    '/meal-entries': {
      get: protectedOperation('读取当日食物', '读取指定日期的餐食营养快照'),
      post: protectedOperation('记录食物', '由服务端根据食品目录计算并保存营养快照'),
    },
    '/xuxu/chat': {
      post: protectedOperation(
        'Chat with Xuxu',
        'Uses the configured CloudBase model with health-safety boundaries; no diagnosis or prescription instructions are provided.',
      ),
    },
  },
};

await writeFile(resolve(process.cwd(), 'openapi.json'), `${JSON.stringify(document, null, 2)}\n`);

function protectedOperation(summary: string, description: string) {
  return {
    summary,
    description,
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: false,
      content: { 'application/json': { schema: { type: 'object' } } },
    },
    responses: {
      '200': { description: '请求成功' },
      '201': { description: '创建成功' },
      '400': { description: '参数校验失败' },
      '401': { description: '未认证' },
      '404': { description: '资源不存在或无权访问' },
    },
  };
}
