<template>
  <view class="weight-chart-card card">
    <view class="card-header">
      <text class="card-title">体重趋势</text>
      <view class="period-tabs">
        <button 
          v-for="tab in periodTabs" 
          :key="tab.value"
          :class="['period-tab', { active: selectedPeriod === tab.value }]"
          @tap="selectPeriod(tab.value)"
        >
          {{ tab.label }}
        </button>
      </view>
    </view>

    <view v-if="loading" class="chart-loading">
      <text>加载中...</text>
    </view>

    <view v-else-if="chartData.length === 0" class="chart-empty">
      <text class="empty-icon">📊</text>
      <text class="empty-text">暂无体重数据</text>
      <text class="empty-hint">记录第一次体重，开始你的健康之旅</text>
    </view>

    <view v-else class="chart-container">
      <!-- 统计信息 -->
      <view class="chart-stats">
        <view class="stat-item">
          <text class="stat-label">当前</text>
          <text class="stat-value">{{ currentWeight }} kg</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item">
          <text class="stat-label">目标</text>
          <text class="stat-value">{{ targetWeight }} kg</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item">
          <text class="stat-label">{{ changeLabel }}</text>
          <text :class="['stat-value', changeClass]">{{ changeValue }}</text>
        </view>
      </view>

      <!-- 图表画布 -->
      <canvas 
        canvas-id="weightChart" 
        class="chart-canvas"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      />

      <!-- 日期范围 -->
      <view class="chart-date-range">
        <text class="date-text">{{ startDate }}</text>
        <text class="date-text">{{ endDate }}</text>
      </view>
    </view>

    <!-- 底部操作 -->
    <view class="chart-footer">
      <button class="action-btn secondary" @tap="addWeight">
        <text class="btn-icon">+</text>
        <text>记录体重</text>
      </button>
      <button class="action-btn" @tap="viewHistory">
        <text>查看详情</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';

interface WeightRecord {
  date: string;
  weight: number;
  timestamp: number;
}

interface Props {
  targetWeight?: number;
  records?: WeightRecord[];
}

const props = withDefaults(defineProps<Props>(), {
  targetWeight: 0,
  records: () => [],
});

const emit = defineEmits<{
  addWeight: [];
  viewHistory: [];
}>();

const loading = ref(false);
const selectedPeriod = ref<'week' | 'month' | 'quarter' | 'year'>('month');

const periodTabs = [
  { label: '周', value: 'week' as const },
  { label: '月', value: 'month' as const },
  { label: '季', value: 'quarter' as const },
  { label: '年', value: 'year' as const },
];

// 根据选择的周期筛选数据
const chartData = computed(() => {
  if (!props.records || props.records.length === 0) return [];
  
  const now = Date.now();
  const periods = {
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    quarter: 90 * 24 * 60 * 60 * 1000,
    year: 365 * 24 * 60 * 60 * 1000,
  };
  
  const cutoff = now - periods[selectedPeriod.value];
  return props.records.filter(r => r.timestamp >= cutoff).sort((a, b) => a.timestamp - b.timestamp);
});

// 当前体重
const currentWeight = computed(() => {
  if (chartData.value.length === 0) return '--';
  return chartData.value[chartData.value.length - 1].weight.toFixed(1);
});

// 变化量
const weightChange = computed(() => {
  if (chartData.value.length < 2) return 0;
  const first = chartData.value[0].weight;
  const last = chartData.value[chartData.value.length - 1].weight;
  return last - first;
});

const changeLabel = computed(() => {
  const labels = {
    week: '周变化',
    month: '月变化',
    quarter: '季变化',
    year: '年变化',
  };
  return labels[selectedPeriod.value];
});

const changeValue = computed(() => {
  const change = weightChange.value;
  if (change === 0) return '0 kg';
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(1)} kg`;
});

const changeClass = computed(() => {
  if (weightChange.value > 0) return 'positive';
  if (weightChange.value < 0) return 'negative';
  return '';
});

// 日期范围
const startDate = computed(() => {
  if (chartData.value.length === 0) return '';
  return formatDate(chartData.value[0].date);
});

const endDate = computed(() => {
  if (chartData.value.length === 0) return '';
  return formatDate(chartData.value[chartData.value.length - 1].date);
});

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function selectPeriod(period: typeof selectedPeriod.value) {
  selectedPeriod.value = period;
}

function addWeight() {
  emit('addWeight');
}

function viewHistory() {
  emit('viewHistory');
}

// 绘制图表
function drawChart() {
  if (chartData.value.length === 0) return;
  
  const query = uni.createSelectorQuery();
  query.select('.chart-canvas')
    .fields({ node: true, size: true })
    .exec((res) => {
      if (!res[0]) return;
      
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      const dpr = uni.getSystemInfoSync().pixelRatio || 1;
      
      canvas.width = res[0].width * dpr;
      canvas.height = res[0].height * dpr;
      ctx.scale(dpr, dpr);
      
      const width = res[0].width;
      const height = res[0].height;
      const padding = { top: 20, right: 20, bottom: 30, left: 40 };
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;
      
      // 清空画布
      ctx.clearRect(0, 0, width, height);
      
      // 数据范围
      const weights = chartData.value.map(d => d.weight);
      const minWeight = Math.min(...weights, props.targetWeight || 0);
      const maxWeight = Math.max(...weights, props.targetWeight || 0);
      const weightRange = maxWeight - minWeight || 1;
      const padding_y = weightRange * 0.1;
      
      // 绘制网格线
      ctx.strokeStyle = '#e8f3ea';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartHeight * i) / 4;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
      }
      
      // 绘制目标线
      if (props.targetWeight) {
        const targetY = padding.top + chartHeight - 
          ((props.targetWeight - minWeight + padding_y) / (weightRange + 2 * padding_y)) * chartHeight;
        
        ctx.strokeStyle = '#f5d99a';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(padding.left, targetY);
        ctx.lineTo(width - padding.right, targetY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // 目标标签
        ctx.fillStyle = '#d4a748';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('目标', width - padding.right - 5, targetY - 5);
      }
      
      // 绘制曲线
      if (chartData.value.length > 0) {
        const points = chartData.value.map((d, i) => {
          const x = padding.left + (chartWidth * i) / (chartData.value.length - 1 || 1);
          const y = padding.top + chartHeight - 
            ((d.weight - minWeight + padding_y) / (weightRange + 2 * padding_y)) * chartHeight;
          return { x, y, weight: d.weight };
        });
        
        // 绘制渐变区域
        const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
        gradient.addColorStop(0, 'rgba(127, 204, 143, 0.2)');
        gradient.addColorStop(1, 'rgba(127, 204, 143, 0.0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(points[0].x, height - padding.bottom);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
        ctx.closePath();
        ctx.fill();
        
        // 绘制线条
        ctx.strokeStyle = '#7fcc8f';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
        
        // 绘制数据点
        points.forEach((p, i) => {
          // 外圈
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
          ctx.fill();
          
          // 内圈
          ctx.fillStyle = '#7fcc8f';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fill();
          
          // 最后一个点显示数值
          if (i === points.length - 1) {
            ctx.fillStyle = '#2d6943';
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(p.weight.toFixed(1), p.x, p.y - 12);
          }
        });
      }
    });
}

let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(e: any) {
  touchStartX = e.touches[0].x;
  touchStartY = e.touches[0].y;
}

function handleTouchMove(e: any) {
  // TODO: 实现拖动查看具体数值
}

function handleTouchEnd(e: any) {
  // TODO: 实现拖动查看具体数值
}

watch([chartData, () => props.targetWeight], () => {
  drawChart();
}, { deep: true });

onMounted(() => {
  setTimeout(() => {
    drawChart();
  }, 100);
});
</script>

<style scoped>
.weight-chart-card {
  margin-bottom: 16rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 2rpx 12rpx rgba(127, 204, 143, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.card-title {
  color: #2d6943;
  font-size: 26rpx;
  font-weight: 800;
}

.period-tabs {
  display: flex;
  gap: 8rpx;
  padding: 4rpx;
  border-radius: 12rpx;
  background: #f8fdf9;
}

.period-tab {
  padding: 8rpx 16rpx;
  border: none;
  border-radius: 8rpx;
  background: transparent;
  color: #76907d;
  font-size: 22rpx;
  font-weight: 600;
  line-height: 1;
  transition: all 0.2s ease;
}

.period-tab::after {
  border: none;
}

.period-tab.active {
  background: #7fcc8f;
  color: #ffffff;
}

/* 加载状态 */
.chart-loading,
.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 20rpx;
  color: #9aaca0;
  font-size: 24rpx;
}

.empty-icon {
  font-size: 64rpx;
  margin-bottom: 16rpx;
}

.empty-text {
  color: #76907d;
  font-size: 26rpx;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.empty-hint {
  color: #9aaca0;
  font-size: 22rpx;
}

/* 统计信息 */
.chart-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 16rpx 0 24rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.stat-label {
  color: #76907d;
  font-size: 20rpx;
  font-weight: 600;
}

.stat-value {
  color: #2d6943;
  font-size: 28rpx;
  font-weight: 800;
}

.stat-value.positive {
  color: #e89b8f;
}

.stat-value.negative {
  color: #7fcc8f;
}

.stat-divider {
  width: 1rpx;
  height: 40rpx;
  background: #e8f3ea;
}

/* 图表 */
.chart-canvas {
  width: 100%;
  height: 400rpx;
  margin-bottom: 12rpx;
}

.chart-date-range {
  display: flex;
  justify-content: space-between;
  padding: 0 20rpx;
  margin-bottom: 20rpx;
}

.date-text {
  color: #9aaca0;
  font-size: 20rpx;
  font-weight: 600;
}

/* 底部操作 */
.chart-footer {
  display: flex;
  gap: 12rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #e8f3ea;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  padding: 18rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #7fcc8f 0%, #6bb97d 100%);
  color: #ffffff;
  font-size: 26rpx;
  font-weight: 700;
  line-height: 1;
  box-shadow: 0 4rpx 12rpx rgba(127, 204, 143, 0.2);
}

.action-btn::after {
  border: none;
}

.action-btn.secondary {
  background: #f8fdf9;
  color: #5c7a67;
  border: 2rpx solid #d4e5d4;
  box-shadow: none;
}

.btn-icon {
  font-size: 32rpx;
  font-weight: 700;
  line-height: 1;
}
</style>
