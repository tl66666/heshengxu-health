<template>
  <view :class="['execution-card', { done: action.done, focused }]">
    <view class="execution-top">
      <button
        class="execution-check"
        :aria-label="action.done ? '重新打开行动' : '标记行动完成'"
        @tap="save(!action.done)"
      >
        {{ action.done ? '✓' : '' }}
      </button>
      <view class="execution-heading"
        ><text class="execution-title">{{ action.title }}</text
        ><text class="execution-meta"
          >{{ action.done ? '已完成' : '进行中' }} · {{ dueLabel }} · {{ checked.length }}/{{
            steps.length
          }}
          步</text
        ></view
      >
    </view>
    <view class="execution-links"
      ><button @tap="navigateTo(`/pages/version-answer/GuidePage?id=${action.guideId}`)">
        {{ guide?.title }} →</button
      ><button @tap="expanded = !expanded">{{ expanded ? '收起记录' : '执行与复盘' }}</button></view
    >
    <view v-if="expanded" class="execution-editor">
      <text class="execution-label">执行清单</text>
      <button
        v-for="(step, index) in steps"
        :key="step"
        :class="['execution-step', { checked: checked.includes(index) }]"
        :aria-pressed="checked.includes(index)"
        @tap="toggleStep(index)"
      >
        <text class="step-box">{{ checked.includes(index) ? '✓' : '' }}</text
        ><text>{{ step }}</text>
      </button>
      <view class="execution-date"
        ><text class="execution-label">计划日期</text
        ><picker
          mode="date"
          :value="dueDate || today"
          @change="
            dueDate = $event.detail.value;
            saved = false;
          "
          ><view class="date-value"
            >{{ dueDate || '暂不安排日期' }} <text>选择 →</text></view
          ></picker
        ><button
          v-if="dueDate"
          class="execution-clear"
          @tap="
            dueDate = '';
            saved = false;
          "
        >
          清除日期
        </button></view
      >
      <text class="execution-label">执行与复盘笔记</text>
      <textarea
        v-model="note"
        @input="saved = false"
        maxlength="500"
        placeholder="实际做了什么？结果怎样？下次继续、修改还是停止？"
        class="execution-note"
      />
      <view class="execution-note-meta"
        ><text>只保存在当前账号的本机空间</text><text>{{ note.length }}/500</text></view
      >
      <view class="execution-buttons"
        ><button class="primary" @tap="save()">保存执行记录</button
        ><button class="secondary" @tap="copySummary">复制摘要</button></view
      >
      <text v-if="saved" class="execution-saved">记录已保存</text>
    </view>
    <text v-if="error" class="error">{{ error }}</text>
    <view class="execution-bottom"
      ><text>{{ action.done ? '完成状态由你确认' : '勾选清单后，可确认行动是否完成' }}</text
      ><button class="quiet-button" @tap="$emit('remove', action.guideId)">移除</button></view
    >
  </view>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { getGuide } from '../../features/version-answer/content.js';
import { actionStepsFor } from '../../features/version-answer/learning.js';
import {
  saveActionDetails,
  type GuideAction,
  type ActionDetails,
  type Library,
} from '../../features/version-answer/store.js';
import { actionDraft, reconcileActionDraft } from '../../features/version-answer/drafts.js';
import { shanghaiDate } from '../../features/lean-muscle/calendar.js';
import { navigateTo } from '../../utils/router.js';
const props = defineProps<{ action: GuideAction; focused?: boolean; draft?: ActionDetails }>();
const emit = defineEmits<{
  changed: [Library, string];
  draft: [ActionDetails];
  remove: [string];
}>();
const guide = computed(() => getGuide(props.action.guideId));
const steps = computed(() => (guide.value ? actionStepsFor(guide.value) : []));
const today = shanghaiDate();
const expanded = ref(Boolean(props.focused));
const initialDraft = props.draft || actionDraft(props.action);
const note = ref(initialDraft.note);
const dueDate = ref(initialDraft.dueDate || '');
const checked = ref([...initialDraft.checkedSteps]);
const error = ref('');
const saved = ref(false);
const dueLabel = computed(() =>
  !props.action.dueDate
    ? '未安排日期'
    : props.action.dueDate === today
      ? '计划今天'
      : `计划 ${props.action.dueDate.slice(5)}`,
);
watch(
  () => props.focused,
  (value) => {
    if (value) expanded.value = true;
  },
);
watch(
  () => props.action,
  (value, previous) => {
    const result = reconcileActionDraft(
      { note: note.value, dueDate: dueDate.value || null, checkedSteps: checked.value },
      previous,
      value,
    );
    note.value = result.draft.note;
    dueDate.value = result.draft.dueDate || '';
    checked.value = [...result.draft.checkedSteps];
    if (result.conflict) error.value = '这项记录在别处更新；你的未保存内容仍保留，请核对后再保存。';
  },
);
watch([note, dueDate, checked], () =>
  emit('draft', {
    note: note.value,
    dueDate: dueDate.value || null,
    checkedSteps: [...checked.value],
  }),
);

function toggleStep(index: number) {
  saved.value = false;
  checked.value = checked.value.includes(index)
    ? checked.value.filter((i) => i !== index)
    : [...checked.value, index];
}
function save(done?: boolean) {
  try {
    const state = saveActionDetails(props.action.guideId, {
      note: note.value,
      dueDate: dueDate.value || null,
      checkedSteps: checked.value,
      done,
    });
    emit('changed', state, props.action.guideId);
    error.value = '';
    saved.value = true;
    uni.showToast({
      title: done === undefined ? '执行记录已保存' : done ? '行动已完成' : '行动已重新打开',
      icon: 'success',
    });
  } catch (e) {
    error.value = e instanceof Error ? e.message : '保存失败，请重试';
  }
}
function copySummary() {
  const text = [
    props.action.title,
    `计划日期：${dueDate.value || '未安排'}`,
    `完成状态：${props.action.done ? '已完成' : '进行中'}`,
    ...steps.value.map((step, index) => `${checked.value.includes(index) ? '✓' : '□'} ${step}`),
    `执行与复盘：${note.value || '尚未填写'}`,
  ].join('\n');
  uni.setClipboardData({
    data: text,
    success: () => uni.showToast({ title: '行动摘要已复制', icon: 'none' }),
    fail: () => {
      error.value = '复制失败，请重试';
    },
  });
}
</script>
