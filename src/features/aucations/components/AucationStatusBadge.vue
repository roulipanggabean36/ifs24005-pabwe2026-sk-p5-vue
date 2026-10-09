<script setup>
import { computed } from "vue";
import { isAucationClosed } from "../utils/aucationUtils";

const props = defineProps({
  closedAt: { type: String, required: true },
});

const closed = computed(() => isAucationClosed(props.closedAt));
</script>

<template>
  <span
    data-testid="status-badge"
    :class="[
      'inline-flex rounded-full px-2.5 py-1 text-xs font-bold',
      closed ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-700',
    ]"
  >
    {{ closed ? "Ditutup" : "Dibuka" }}
  </span>
</template>