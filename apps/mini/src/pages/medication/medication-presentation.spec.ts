import { describe, expect, it } from 'vitest';
import pageSource from './MedicationManagePage.vue?raw';

describe('medication page presentation contracts', () => {
  it('renders the shared watercolor medication illustration in every reminder row', () => {
    expect(pageSource).toContain('class="med-icon"');
    expect(pageSource).toContain('/static/icons/watercolor/medication.png');
    expect(pageSource).toContain('v-for="item in medications"');
    expect(pageSource).not.toContain('@tap="openForm">＋</button>');
  });

  it('shows the companion artwork as a readable three-by-two banner', () => {
    expect(pageSource).toContain('/static/illustrations/medication-companion-banner.png');
    expect(pageSource).toContain('class="companion-banner"');
    expect(pageSource).toContain('aspect-ratio: 3 / 2');
  });

  it('keeps real reminder editing and check-in actions intact', () => {
    expect(pageSource).toContain('saveMedicationReminder');
    expect(pageSource).toContain('setMedicationCheckin');
    expect(pageSource).toContain('deleteMedicationReminder');
    expect(pageSource).toContain('editingId');
  });
});
