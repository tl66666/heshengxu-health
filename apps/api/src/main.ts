import 'reflect-metadata';
import { createApp } from './app.js';

const app = await createApp();
await app.listen(Number(process.env.API_PORT ?? 3000));
