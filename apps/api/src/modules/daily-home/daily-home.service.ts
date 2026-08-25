import { Injectable } from '@nestjs/common';
import { selectDailyAction } from '@heban/domain';
import { HealthProfileService } from '../health-profile/health-profile.service.js';
import { HealthPlansService } from '../health-plans/health-plans.service.js';
import { HealthRecordsService } from '../health-records/health-records.service.js';

@Injectable()
export class DailyHomeService {
  constructor(
    private readonly profiles: HealthProfileService,
    private readonly plans: HealthPlansService,
    private readonly records: HealthRecordsService,
  ) {}

  async getToday(userId: string, date: string) {
    const [profile, activePlan, todayRecords] = await Promise.all([
      this.profiles.getForUser(userId),
      this.plans.getForUser(userId, date),
      this.records.getTodayForUser(userId, date),
    ]);
    const hasWeight = todayRecords.weight !== null;
    const hasMeal = todayRecords.meals.length > 0;
    const hasActivity = todayRecords.activities.length > 0;
    const hasSleep = todayRecords.sleep !== null;
    const completed = [hasWeight, hasMeal, hasActivity, hasSleep].filter(Boolean).length;

    return {
      date,
      displayName: profile.displayName ?? null,
      activePlan,
      todayRecords,
      todayTasks: activePlan?.tasks ?? [],
      dailyAction: selectDailyAction({
        planKind: activePlan?.kind ?? null,
        hasSleepForPreviousNight: hasSleep,
        hasWeightToday: hasWeight,
        hasMealToday: hasMeal,
        hasActivityToday: hasActivity,
      }),
      recordingProgress: { completed, total: 4 as const, hasWeight, hasMeal, hasActivity, hasSleep },
    };
  }
}
