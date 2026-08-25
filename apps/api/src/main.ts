import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';

const envPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../../.env');
if (existsSync(envPath)) loadEnvFile(envPath);

const app = await createApp();
await app.listen(Number(process.env.API_PORT ?? 3000));
