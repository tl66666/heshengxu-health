import { ref } from 'vue';
import type { HealthRecordType } from '../../../../../packages/contracts/src/health-loop.js';

// Tab 页不能用 URL 参数跳转；这里暂存目标表单类型，供记录页 onShow 消费。
const pendingType = ref<HealthRecordType | null>(null);

export function requestRecordTypeFocus(type: HealthRecordType) {
  pendingType.value = type;
}

export function consumeRecordTypeFocus() {
  const requested = pendingType.value;
  pendingType.value = null;
  return requested;
}
