export type MedicationFrequency = 'daily' | 'weekly' | 'as_needed';

export type MedicationReminder = {
  id: string;
  name: string;
  doseNote: string;
  frequency: MedicationFrequency;
  reminderTime?: string;
  note?: string;
  active: boolean;
  createdAt: string;
};

export type MedicationCheckin = {
  reminderId: string;
  date: string;
  checkedAt: string;
};
