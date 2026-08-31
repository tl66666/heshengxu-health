<template>
  <view class="page">
    <AppNavBar title="用药记录" route="/pages/medication/MedicationManagePage" />
    <view class="page-head"><view><text class="kicker">今天 · {{ todayLabel }}</text><text class="title">按医嘱，慢慢来</text></view><button class="head-add" aria-label="添加用药" @tap="openForm">＋</button></view>
    <view class="summary-line"><view><text class="summary-number">{{ completedCount }}<text class="summary-total"> / {{ medications.length }}</text></text><text class="summary-label">今日已完成</text></view><view class="summary-copy">{{ medications.length ? (completedCount === medications.length ? '今天的提醒都完成了' : '还有提醒，按自己的节奏来') : '添加一条提醒，今天会更安心' }}</view></view>
    <view v-if="medications.length" class="progress-track"><view class="progress-fill" :style="{ width: `${progress}%` }" /></view>

    <view class="section-head"><view><text class="section-title">今日提醒</text><text class="section-caption">按时间排序，完成后轻轻点一下</text></view><button class="text-action" @tap="openForm">添加提醒</button></view>
    <view v-if="medications.length" class="timeline">
      <view v-for="item in medications" :key="item.id" class="med-row" :class="{ done: item.checked }">
        <view class="time-rail"><text>{{ item.reminderTime || '--:--' }}</text><view class="rail-dot" :class="{ checked: item.checked }" /></view>
        <button class="check-button" :class="{ checked: item.checked }" :aria-label="item.checked ? '取消打卡' : '完成打卡'" @tap="toggleChecked(item)"><image v-if="item.checked" src="/static/icons/svg/check.svg" mode="aspectFit" /></button>
        <view class="med-copy"><text class="med-name">{{ item.name }}</text><text class="med-meta">{{ item.doseNote }} · {{ frequencyLabel(item.frequency) }}</text><text v-if="item.note" class="med-note">{{ item.note }}</text></view>
        <button class="more-button" aria-label="管理提醒" @tap="manageMedication(item)">···</button>
      </view>
    </view>
    <view v-else class="empty-state"><image src="/static/icons/watercolor/medication.png" mode="aspectFit" /><text class="empty-title">还没有用药提醒</text><text class="empty-copy">把医生交代的时间记下来，和生序只帮你整理，不替你做用药决定。</text><button class="empty-action" @tap="openForm">添加第一条提醒</button></view>

    <view v-if="showForm" class="form-scrim" @tap="closeForm" />
    <view v-if="showForm" class="form-panel" @tap.stop><view class="form-head"><view><text class="section-title">{{ editingId ? '修改提醒' : '添加提醒' }}</text><text class="section-caption">按处方填写，和生序只负责提醒</text></view><button class="close-button" aria-label="关闭" @tap="closeForm">×</button></view><input v-model="draft.name" class="field" maxlength="24" placeholder="药物或提醒名称" /><view class="field-grid"><input v-model="draft.doseNote" class="field" maxlength="20" placeholder="剂量说明，如：按医嘱" /><input v-model="draft.reminderTime" class="field" type="time" /></view><view class="frequency-row"><button v-for="item in frequencies" :key="item.value" class="frequency" :class="{ active: draft.frequency === item.value }" @tap="draft.frequency = item.value">{{ item.label }}</button></view><input v-model="draft.note" class="field" maxlength="50" placeholder="备注（选填）" /><button class="primary-button" @tap="saveMedication">保存提醒</button></view>
    <view class="safety-note"><text>用药提示</text><text>请以处方、药品说明书和医生指导为准。这里不推荐药物、剂量或停药。</text></view>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import AppNavBar from '../../components/AppNavBar.vue';
import { deleteMedicationReminder, loadCheckinsForDate, loadMedicationReminders, saveMedicationReminder, setMedicationCheckin } from '../../features/medication/medication.service.js';
import type { MedicationFrequency, MedicationReminder } from '../../features/medication/medication.types.js';
type MedicationView = MedicationReminder & { checked: boolean };
const medications = ref<MedicationView[]>([]); const showForm = ref(false); const editingId = ref<string | null>(null);
const frequencies: Array<{ value: MedicationFrequency; label: string }> = [{ value: 'daily', label: '每日' }, { value: 'weekly', label: '每周' }, { value: 'as_needed', label: '按需' }];
const draft = reactive<{ name: string; doseNote: string; frequency: MedicationFrequency; reminderTime: string; note: string }>({ name: '', doseNote: '', frequency: 'daily', reminderTime: '', note: '' });
const completedCount = computed(() => medications.value.filter(item => item.checked).length); const progress = computed(() => medications.value.length ? Math.round(completedCount.value / medications.value.length * 100) : 0); const todayLabel = computed(() => `${new Date().getMonth() + 1}月${new Date().getDate()}日`);
function frequencyLabel(value: MedicationFrequency) { return frequencies.find(item => item.value === value)?.label || '每日'; }
function load() { const date = new Date().toISOString().slice(0, 10); const checked = new Set(loadCheckinsForDate(date).map(item => item.reminderId)); medications.value = loadMedicationReminders().sort((a, b) => (a.reminderTime || '99:99').localeCompare(b.reminderTime || '99:99')).map(item => ({ ...item, checked: checked.has(item.id) })); }
function toggleChecked(item: MedicationView) { item.checked = !item.checked; setMedicationCheckin(item.id, new Date().toISOString().slice(0, 10), item.checked); uni.showToast({ title: item.checked ? '已完成' : '已取消', icon: 'none' }); }
function openForm() { editingId.value = null; Object.assign(draft, { name: '', doseNote: '', frequency: 'daily', reminderTime: '', note: '' }); showForm.value = true; }
function closeForm() { showForm.value = false; editingId.value = null; }
function saveMedication() { if (!draft.name.trim()) { uni.showToast({ title: '请填写提醒名称', icon: 'none' }); return; } const reminder: MedicationReminder = { id: editingId.value || `${Date.now()}`, name: draft.name.trim(), doseNote: draft.doseNote.trim() || '按医嘱', frequency: draft.frequency, reminderTime: draft.reminderTime || undefined, note: draft.note.trim() || undefined, active: true, createdAt: new Date().toISOString() }; saveMedicationReminder(reminder); closeForm(); load(); uni.showToast({ title: '已保存', icon: 'success' }); }
function manageMedication(item: MedicationView) { uni.showActionSheet({ itemList: ['修改提醒', '删除提醒'], success: ({ tapIndex }) => { if (tapIndex === 0) { editingId.value = item.id; Object.assign(draft, { name: item.name, doseNote: item.doseNote, frequency: item.frequency, reminderTime: item.reminderTime || '', note: item.note || '' }); showForm.value = true; } else { uni.showModal({ title: '删除这条提醒？', content: '只删除记录，不影响实际用药。', success: ({ confirm }) => { if (confirm) { deleteMedicationReminder(item.id); load(); } } }); } } }); }
onShow(load);
</script>

<style scoped>
.page { min-height: 100vh; padding: 0 28rpx 58rpx; background: #fff7f1; color: #51484b; }
.page-head { display: flex; align-items: flex-start; justify-content: space-between; padding: 28rpx 2rpx 24rpx; }
.kicker { display: block; color: #aa8f8d; font-size: 20rpx; }
.title { display: block; margin-top: 8rpx; color: #51454c; font-size: 34rpx; font-weight: 700; }
.head-add { width: 58rpx; height: 58rpx; border: 1rpx solid #e9cfd1; border-radius: 50%; color: #b96c7d; background: #fffdfb; font-size: 32rpx; line-height: 54rpx; }
.summary-line { display: flex; align-items: flex-end; justify-content: space-between; padding: 22rpx 24rpx; border: 1rpx solid rgba(255, 255, 255, .9); border-radius: 18rpx; background: rgba(255, 253, 251, .82); box-shadow: 0 12rpx 28rpx rgba(139, 102, 89, .07), inset 0 1rpx 0 rgba(255, 255, 255, .95); backdrop-filter: blur(18px); }
.summary-number { color: #b85e78; font-size: 44rpx; font-weight: 700; line-height: 1; }
.summary-total { color: #b8a6a5; font-size: 24rpx; font-weight: 400; }
.summary-label { display: block; margin-top: 8rpx; color: #9a898c; font-size: 19rpx; }
.summary-copy { max-width: 240rpx; color: #8c7c80; font-size: 20rpx; line-height: 1.5; text-align: right; }
.progress-track { height: 8rpx; margin-top: 12rpx; border-radius: 8rpx; background: #f3e2df; overflow: hidden; }.progress-fill { height: 100%; border-radius: inherit; background: #e2a0a6; transition: width .25s ease; }
.section-head { display: flex; align-items: flex-end; justify-content: space-between; margin-top: 32rpx; margin-bottom: 12rpx; }
.section-title { display: block; color: #625259; font-size: 28rpx; font-weight: 700; }.section-caption { display: block; margin-top: 5rpx; color: #a29395; font-size: 19rpx; }.text-action { padding: 7rpx 0; color: #b66d80; font-size: 21rpx; }
.timeline { border-top: 1rpx solid #efdfda; }.med-row { display: flex; align-items: center; min-height: 116rpx; border-bottom: 1rpx solid #f0e3df; }.med-row.done { opacity: .58; }
.time-rail { display: flex; align-items: center; flex-direction: column; width: 70rpx; flex: none; padding-right: 12rpx; color: #a18f91; font-size: 18rpx; }.rail-dot { width: 12rpx; height: 12rpx; margin-top: 8rpx; border: 2rpx solid #e1a2ad; border-radius: 50%; background: #fff7f1; }.rail-dot.checked { border-color: #d88799; background: #d88799; }
.check-button { display: flex; align-items: center; justify-content: center; width: 42rpx; height: 42rpx; flex: none; margin-right: 14rpx; border: 2rpx solid #ddb1b8; border-radius: 50%; background: #fffdfb; }.check-button.checked { border-color: #d88799; background: #d88799; }.check-button image { width: 25rpx; height: 25rpx; filter: brightness(0) invert(1); }
.med-copy { min-width: 0; flex: 1; }.med-name, .med-meta, .med-note { display: block; }.med-name { color: #605159; font-size: 25rpx; font-weight: 700; }.med-meta { margin-top: 5rpx; color: #968587; font-size: 19rpx; }.med-note { margin-top: 4rpx; color: #b0a0a0; font-size: 18rpx; }.more-button { width: 54rpx; height: 54rpx; color: #a18f91; font-size: 23rpx; }
.empty-state { display: flex; align-items: center; flex-direction: column; padding: 66rpx 24rpx 46rpx; text-align: center; }.empty-state image { width: 176rpx; height: 138rpx; opacity: .88; mix-blend-mode: multiply; }.empty-title { margin-top: 12rpx; color: #6b555d; font-size: 27rpx; font-weight: 700; }.empty-copy { max-width: 540rpx; margin-top: 8rpx; color: #9a898c; font-size: 20rpx; line-height: 1.5; }.empty-action { margin-top: 20rpx; padding: 13rpx 20rpx; border-radius: 12rpx; color: #b35f76; background: #fff0f3; font-size: 21rpx; }
.form-scrim { position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 40; background: rgba(74, 53, 58, .28); }
.form-panel { position: fixed; right: 0; bottom: 0; left: 0; z-index: 41; padding: 28rpx 28rpx 42rpx; border-radius: 26rpx 26rpx 0 0; border: 1rpx solid #f0dfda; background: #fffdfb; box-shadow: 0 -12rpx 36rpx rgba(104, 76, 80, .14); }
.form-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16rpx; }.close-button { width: 46rpx; height: 46rpx; border-radius: 50%; color: #9b8589; background: #f8efec; font-size: 28rpx; line-height: 42rpx; }
.field { width: 100%; height: 70rpx; margin-bottom: 12rpx; padding: 0 14rpx; border: 1rpx solid #efdfda; border-radius: 11rpx; color: #625259; background: #fffaf8; font-size: 21rpx; }.field-grid { display: grid; grid-template-columns: 1fr 180rpx; gap: 12rpx; }.frequency-row { display: flex; gap: 9rpx; margin: 2rpx 0 12rpx; }.frequency { flex: 1; padding: 10rpx 0; border: 1rpx solid #efdfda; border-radius: 10rpx; color: #9a898c; background: #fffaf8; font-size: 19rpx; }.frequency.active { border-color: #e2a0ad; color: #b45e78; background: #fff0f3; }.primary-button { width: 100%; height: 78rpx; border-radius: 38rpx; color: #fff; background: #de8fa2; box-shadow: 0 8rpx 18rpx rgba(214, 123, 143, .18); font-size: 25rpx; line-height: 78rpx; }
.safety-note { display: flex; gap: 10rpx; margin-top: 28rpx; padding: 14rpx 16rpx; border-left: 4rpx solid #e6b1a7; background: #fff2ec; color: #a08e8d; font-size: 18rpx; line-height: 1.5; }.safety-note text:first-child { flex: none; color: #b46d69; font-weight: 700; }
@media (min-width: 700px) { .page { max-width: 760px; margin: 0 auto; } .form-panel { right: 50%; left: 50%; width: 760px; transform: translateX(-50%); } }
</style>
<style scoped>
.page {
  padding: 0 28rpx calc(74rpx + env(safe-area-inset-bottom));
  background: radial-gradient(circle at 88% 10%, rgba(240, 221, 228, .5), transparent 30%), linear-gradient(180deg, #fffaf6 0%, #f6f5f2 100%);
  color: #5c555b;
}
.page-head { padding: 28rpx 2rpx 24rpx; }
.kicker { color: #9a8f93; letter-spacing: .5rpx; }.title { color: #5d555d; font-size: 36rpx; letter-spacing: 0; }
.head-add { position: relative; display: flex; align-items: flex-end; justify-content: center; width: 112rpx; height: 72rpx; padding-bottom: 8rpx; border: 1rpx solid rgba(255,255,255,.94); border-radius: 22rpx; background: rgba(255,253,251,.82) url('/static/icons/watercolor/medication.png') center 7rpx / 38rpx 38rpx no-repeat; color: #718b8a; box-shadow: 0 10rpx 22rpx rgba(126,104,94,.08), inset 0 1rpx 0 rgba(255,255,255,.96); font-size: 18rpx; }
.head-add::after { content: '添加'; color: #718b8a; font-size: 18rpx; }.head-add-label { display: none; }
.summary-line { padding: 24rpx 24rpx; border: 1rpx solid rgba(255,255,255,.94); border-radius: 22rpx; background: rgba(255,253,251,.78); box-shadow: 0 14rpx 30rpx rgba(126,104,94,.08), inset 0 1rpx 0 rgba(255,255,255,.96); }.summary-number { color: #718f91; font-size: 48rpx; }.summary-total { color: #b0a2a3; }.summary-label { color: #9d9193; }.summary-copy { color: #8f858a; }.progress-track { height: 10rpx; margin-top: 14rpx; background: #f1e7e3; }.progress-fill { background: linear-gradient(90deg, #a7c9c0, #7fb2b3); }
.section-head { margin-top: 34rpx; margin-bottom: 16rpx; }.section-title { color: #655c63; font-size: 29rpx; }.section-caption { color: #a59a9c; }.text-action { padding: 10rpx 16rpx; border: 1rpx solid #dfd4d2; border-radius: 18rpx; color: #718b8a; background: rgba(255,253,251,.72); }
.timeline { border: 1rpx solid rgba(255,255,255,.86); border-radius: 24rpx; background: rgba(255,253,251,.56); box-shadow: 0 14rpx 30rpx rgba(126,104,94,.07); overflow: hidden; }.med-row { position: relative; min-height: 136rpx; padding: 18rpx 14rpx 18rpx 0; border-bottom: 1rpx solid rgba(239,227,222,.9); }.med-row:last-child { border-bottom: 0; }.med-row.done { background: rgba(235,245,242,.46); }.time-rail { width: 76rpx; color: #9b8f92; }.rail-dot { border-color: #9fc8c0; background: #fffaf6; }.rail-dot.checked { border-color: #78afa6; background: #78afa6; }
.check-button { width: 46rpx; height: 46rpx; margin-right: 12rpx; border-color: #b8ceca; background: #fffdfb; }.check-button.checked { border-color: #79b3aa; background: #79b3aa; }
.med-row::before { content: ''; display: block; width: 66rpx; height: 66rpx; flex: none; margin-right: 14rpx; border-radius: 20rpx; background: rgba(239,247,244,.86) url('/static/icons/watercolor/medication.png') center / 56rpx 56rpx no-repeat; box-shadow: inset 0 1rpx 0 rgba(255,255,255,.9); mix-blend-mode: multiply; }
.med-copy { padding-right: 4rpx; }.med-name { color: #5f5860; font-size: 27rpx; }.med-meta { color: #92878b; }.med-note { color: #a89b9d; }.more-button { width: 50rpx; color: #a3979a; font-size: 22rpx; }
.empty-state { margin-top: 18rpx; padding: 72rpx 28rpx 54rpx; border: 1rpx solid rgba(255,255,255,.9); border-radius: 24rpx; background: rgba(255,253,251,.72); box-shadow: 0 14rpx 30rpx rgba(126,104,94,.07); }.empty-state image { width: 198rpx; height: 156rpx; opacity: .92; }.empty-title { color: #665d64; }.empty-copy { color: #9e9294; }.empty-action { padding: 16rpx 24rpx; border: 1rpx solid #d6e3df; border-radius: 20rpx; color: #6e8b88; background: #edf6f3; }
.form-scrim { background: rgba(78,61,64,.25); backdrop-filter: blur(4rpx); }.form-panel { padding: 30rpx 28rpx calc(34rpx + env(safe-area-inset-bottom)); border: 1rpx solid rgba(255,255,255,.94); border-radius: 30rpx 30rpx 0 0; background: rgba(255,253,251,.96); box-shadow: 0 -18rpx 40rpx rgba(104,76,80,.16); }.close-button { color: #8e7f84; background: #f5eeeb; }.field { height: 78rpx; padding: 0 18rpx; border-color: #eaded9; border-radius: 16rpx; background: #fffaf7; color: #625a60; }.frequency { min-height: 58rpx; border-color: #eaded9; border-radius: 16rpx; background: #fffaf7; color: #9a8d91; }.frequency.active { border-color: #abcfc8; color: #668c87; background: #edf6f3; }.primary-button { height: 84rpx; border-radius: 24rpx; background: linear-gradient(135deg, #7fb6b4, #609da7); box-shadow: 0 12rpx 24rpx rgba(94,157,176,.2); line-height: 84rpx; }.safety-note { border-left-color: #d7aaa0; background: #fff4ef; color: #9d8e8c; }.safety-note text:first-child { color: #b2776d; }
</style>
