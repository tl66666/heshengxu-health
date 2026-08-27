import { BadRequestException, Injectable } from '@nestjs/common';
import type { FoodImportLicense, FoodImportRow } from './food-import.types.js';

@Injectable()
export class FoodImportService {
  normalizeRows(rows: readonly FoodImportRow[], license?: FoodImportLicense) {
    if (!license?.sourceName?.trim() || !license.sourceLicense?.trim()) {
      throw new BadRequestException('导入食品数据必须声明来源和许可');
    }
    return rows.map((row, index) => {
      if (!row.name?.trim()) throw new BadRequestException(`第 ${index + 1} 行缺少食品名称`);
      for (const value of [row.energyKcal, row.proteinG, row.fatG, row.carbohydrateG]) {
        if (!Number.isFinite(value) || value < 0) {
          throw new BadRequestException(`第 ${index + 1} 行营养数值无效`);
        }
      }
      return {
        name: row.name.trim(),
        brand: row.brand?.trim() || null,
        categoryName: row.categoryName?.trim() || null,
        nutrition: {
          basisGrams: 100,
          energyKcal: row.energyKcal,
          proteinG: row.proteinG,
          fatG: row.fatG,
          carbohydrateG: row.carbohydrateG,
          dietaryFiberG: row.dietaryFiberG ?? null,
          sodiumMg: row.sodiumMg ?? null,
        },
        aliases: [...new Set((row.aliases ?? []).map((alias) => alias.trim()).filter(Boolean))],
        servings: (row.servings ?? [])
          .filter(
            (serving) =>
              serving.label.trim() && Number.isFinite(serving.grams) && serving.grams > 0,
          )
          .map((serving) => ({ label: serving.label.trim(), grams: serving.grams })),
        provenance: { ...license },
      };
    });
  }
}
