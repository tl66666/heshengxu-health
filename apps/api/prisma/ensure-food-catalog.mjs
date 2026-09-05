import { PrismaClient } from '@prisma/client';
import { spawnSync } from 'node:child_process';

const prisma = new PrismaClient();
try {
  const count = await prisma.foodItem.count({ where: { isActive: true } });
  if (count < 1000) {
    console.log(`[food-catalog] only ${count} active foods; importing bundled food.sql`);
    const result = spawnSync(process.execPath, ['--experimental-strip-types', 'scripts/import-common-foods.ts'], {
      cwd: '/app',
      stdio: 'inherit',
      env: process.env,
    });
    if (result.status !== 0) process.exit(result.status ?? 1);
  } else {
    console.log(`[food-catalog] ${count} active foods available`);
  }
} finally {
  await prisma.$disconnect();
}
