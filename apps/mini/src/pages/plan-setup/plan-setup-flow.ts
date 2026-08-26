import type { PlanKind } from '../../../../../packages/contracts/src/health-loop.js';

export function planSetupFields(kind: PlanKind) {
  return {
    showDirection: kind === 'weight',
    showTargetWeight: kind === 'weight',
  };
}
