<template>
  <view class="lean-page">
    <AppNavBar
      :title="editingId ? '训练日志' : '记录力量训练'"
      route="/pages/lean-muscle/TrainingPage"
    />
    <view class="hero"
      ><text class="eyebrow">ONE SESSION AT A TIME</text
      ><text class="hero-title">记下真实完成的。</text
      ><text class="hero-copy">组数、次数、重量，让下一次有迹可循。</text><LeanArt class="hero-art"
    /></view>
    <view class="panel">
      <view class="two-columns"
        ><view
          ><text class="field-label">实际训练日期</text
          ><picker mode="date" :value="date" :end="today" @change="date = $event.detail.value"
            ><view class="picker">{{ date }}</view></picker
          ></view
        ><view
          ><text class="field-label">实际时长 / 分钟</text
          ><input v-model="duration" type="number" placeholder="例如 20" /></view
      ></view>
      <text class="note"
        >只保存实际完成的正式组。自重动作填 0 kg；哑铃请一直使用相同的重量口径。</text
      >
    </view>
    <view v-for="(exercise, index) in exercises" :key="exercise.key" class="panel">
      <view class="section-top"
        ><picker
          :range="exerciseOptions.map((e) => e.name)"
          :value="exerciseOptions.findIndex((e) => e.id === exercise.exerciseId)"
          @change="changeExercise(index, Number($event.detail.value))"
          ><text class="section-title">{{ exerciseName(exercise.exerciseId) }}　⌄</text></picker
        ><button class="quiet-button danger" @tap="exercises.splice(index, 1)">移除</button></view
      >
      <text class="muted">{{
        exerciseOptions.find((e) => e.id === exercise.exerciseId)?.tip
      }}</text>
      <view class="set-head"
        ><text>正式组</text><text>实际次数</text><text>负重 / kg</text><text
      /></view>
      <view v-for="(set, setIndex) in exercise.sets" :key="set.key" class="set-row"
        ><text class="set-index">{{ setIndex + 1 }}</text
        ><input v-model="set.reps" type="number" placeholder="次" /><input
          v-model="set.loadKg"
          type="digit"
          placeholder="自重填 0"
        /><button
          class="quiet-button danger"
          :aria-label="`移除第 ${setIndex + 1} 组`"
          @tap="exercise.sets.splice(setIndex, 1)"
        >
          ×
        </button></view
      >
      <button class="quiet-button" @tap="exercise.sets.push(newSet())">＋ 添加正式组</button>
    </view>
    <button class="secondary" @tap="addExercise">＋ 添加一个动作</button>
    <view class="panel"
      ><text class="field-label">训练感受 / 选填</text
      ><textarea v-model="note" maxlength="200" placeholder="动作完成如何？下次想调整什么？" /><text
        class="note"
        >疼痛或明显不适时停止相关动作，不为补分强撑。</text
      ></view
    >
    <text v-if="error" class="error">{{ error }}</text>
    <button class="primary" :disabled="saving" @tap="save">
      {{ saving ? '保存中…' : editingId ? '保存修改' : '保存这次训练' }}
    </button>
    <button v-if="editingId" class="quiet-button danger" style="margin-top: 25rpx" @tap="remove">
      删除这条训练日志
    </button>
  </view>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AppNavBar from '../../components/AppNavBar.vue';
import LeanArt from './LeanArt.vue';
import { exerciseOptions, exerciseName } from '../../features/lean-muscle/training.js';
import { saveSession, deleteSession, loadJournal } from '../../features/lean-muscle/store.js';
import { shanghaiDate } from '../../features/lean-muscle/calendar.js';
import { navigateBack } from '../../utils/router.js';
let counter = 0;
const key = () => ++counter;
function newSet() {
  return { key: key(), reps: '', loadKg: '0' };
}
const today = shanghaiDate();
const date = ref(today);
const editingId = ref('');
const duration = ref('');
const note = ref('');
const saving = ref(false);
const error = ref('');
const exercises = ref([{ key: key(), exerciseId: 'wall-pushup', sets: [newSet()] }]);
function addExercise() {
  exercises.value.push({ key: key(), exerciseId: 'chair-squat', sets: [newSet()] });
}
function changeExercise(index: number, selected: number) {
  const option = exerciseOptions[selected];
  if (option) exercises.value[index]!.exerciseId = option.id;
}
onLoad((query) => {
  if (!query?.id) return;
  const session = loadJournal().sessions.find((s) => s.id === query.id);
  if (!session) {
    error.value = '记录不存在，请返回重新打开';
    return;
  }
  editingId.value = session.id;
  date.value = session.date;
  duration.value = String(session.durationMinutes);
  note.value = session.note;
  exercises.value = session.exercises.map((e) => ({
    key: key(),
    exerciseId: e.exerciseId,
    sets: e.sets.map((s) => ({ key: key(), reps: String(s.reps), loadKg: String(s.loadKg) })),
  }));
});
function save() {
  if (saving.value) return;
  saving.value = true;
  try {
    if (
      exercises.value.some((e) =>
        e.sets.some((s) => !String(s.reps).trim() || !String(s.loadKg).trim()),
      )
    )
      throw new Error('请填写每个正式组的次数和重量，自重填 0');
    saveSession({
      id: editingId.value || undefined,
      date: date.value,
      durationMinutes: Number(duration.value),
      note: note.value,
      exercises: exercises.value.map((e) => ({
        exerciseId: e.exerciseId,
        sets: e.sets.map((s) => ({ reps: Number(s.reps), loadKg: Number(s.loadKg) })),
      })),
    });
    uni.showToast({ title: '训练已保存', icon: 'success' });
    navigateBack();
  } catch (e) {
    error.value = e instanceof Error ? e.message : '保存失败，请重试';
  } finally {
    saving.value = false;
  }
}
function remove() {
  uni.showModal({
    title: '删除这次训练？',
    content: '对应运动记录与评分会同步更新。',
    success: ({ confirm }) => {
      if (!confirm) return;
      try {
        deleteSession(editingId.value);
        navigateBack();
      } catch {
        error.value = '删除失败，请重试';
      }
    },
  });
}
</script>
<style scoped>
.set-head,
.set-row {
  display: grid;
  grid-template-columns: 70rpx 1fr 1fr 35rpx;
  gap: 12rpx;
  align-items: center;
  margin: 16rpx 0;
}
.set-head {
  color: #7d8c78;
  font-size: 21rpx;
  margin-top: 25rpx;
}
.set-row input {
  padding: 15rpx 12rpx;
  min-width: 0;
  font-size: 25rpx;
}
.set-index {
  background: #edf3e6;
  border-radius: 50%;
  width: 49rpx;
  height: 49rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b866b;
  font-size: 24rpx;
}
</style>
