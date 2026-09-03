import { computed, reactive, ref } from 'vue';
import { calculateBmi, classifyBmi } from '../../../../packages/domain/src/bmi.js';

export type HealthGoal =
  'weight_management' | 'weight_maintenance' | 'muscle_gain' | 'sleep' | 'energy' | 'mood';

export type OnboardingForm = {
  displayName: string;
  sex: 'female' | 'male' | 'unspecified';
  birthDate: string;
  heightCm: string;
  weightKg: string;
  targetWeightKg: string;
  primaryGoal: HealthGoal | '';
  goals: HealthGoal[];
};

const form = reactive<OnboardingForm>({
  displayName: '',
  sex: 'unspecified',
  birthDate: '',
  heightCm: '168',
  weightKg: '60',
  targetWeightKg: '',
  primaryGoal: '',
  goals: [],
});

const bmi = computed(() => {
  const height = Number(form.heightCm);
  const weight = Number(form.weightKg);
  return height > 0 && weight > 0 ? calculateBmi(height, weight) : null;
});

const bmiCategory = computed(() => {
  const value = bmi.value;
  return value === null ? null : classifyBmi(value);
});

export const onboardingState = {
  form,
  step: ref(0),
  completed: ref(false),
  bmi,
  bmiCategory,
};

export function resetOnboarding() {
  Object.assign(form, {
    displayName: '',
    sex: 'unspecified',
    birthDate: '',
    heightCm: '168',
    weightKg: '60',
    targetWeightKg: '',
    primaryGoal: '',
    goals: [],
  });
  onboardingState.step.value = 0;
  onboardingState.completed.value = false;
}
