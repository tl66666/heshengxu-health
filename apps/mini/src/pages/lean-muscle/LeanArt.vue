<template>
  <image :src="failed ? fallback : source" mode="aspectFit" @error="failed = true" />
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { leanArt } from '../../features/lean-muscle/art.js';
const props = withDefaults(defineProps<{ kind?: 'muscle' | 'score' | 'bible' }>(), {
  kind: 'muscle',
});
const failed = ref(false);
const source = computed(() => leanArt[props.kind]);
const fallback = computed(() =>
  props.kind === 'bible'
    ? '/static/icons/svg/lean-book.svg'
    : props.kind === 'score'
      ? '/static/icons/svg/lean-score.svg'
      : '/static/icons/svg/activity-strength.svg',
);
</script>
