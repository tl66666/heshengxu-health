import { describe, expect, it } from 'vitest';
import pageSource from './MedicationManagePage.vue?raw';

describe('medication page presentation contracts', () => {
  it('uses the shared watercolor medication illustration for add and timeline surfaces', () => {
    expect(pageSource).toContain("url('/static/icons/watercolor/medication.png')");
    expect(pageSource).toContain('.med-row::before');
    expect(pageSource).not.toContain('font-size: 32rpx; line-height: 54rpx');
  });

  it('keeps real reminder editing and check-in actions intact', () => {
    expect(pageSource).toContain('saveMedicationReminder');
    expect(pageSource).toContain('setMedicationCheckin');
    expect(pageSource).toContain('deleteMedicationReminder');
    expect(pageSource).toContain('editingId');
  });
});
