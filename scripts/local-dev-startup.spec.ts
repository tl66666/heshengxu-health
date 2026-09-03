import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(import.meta.dirname, '..');
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('local development startup contract', () => {
  it('keeps database services persistent and restartable', () => {
    const compose = read('infra/docker/docker-compose.yml');
    expect(compose.match(/restart:\s*unless-stopped/gu)).toHaveLength(2);
    expect(compose).toContain('postgres_data:/var/lib/postgresql/data');
    expect(compose).toContain('redis_data:/data');
  });

  it('starts healthy services and imports the full catalog only when missing', () => {
    const script = read('scripts/start-local-dev.ps1');
    expect(script).toContain('docker compose');
    expect(script).toContain('--wait');
    expect(script).toContain('$MinimumFoodCount = 10000');
    expect(script).toContain('food:import');
    expect(script).toContain('Wait-ApiHealth');
    expect(script).toContain('SkipMiniWatcher');
    expect(script).toContain('npm --prefix apps/mini run dev:mp-weixin');
    expect(script).not.toMatch(/\bpnpm\b/u);
    expect(script).not.toContain('docker-postgres-1');
  });

  it('uses one PowerShell coordinator from the novice-friendly batch file', () => {
    const batch = read('start-dev.bat');
    expect(batch).toContain('scripts\\start-local-dev.ps1');
    expect(batch).not.toMatch(/\bpnpm\b/u);
    expect(batch).not.toContain('docker-postgres-1');
  });
});
