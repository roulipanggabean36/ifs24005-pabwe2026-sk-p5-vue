<script setup>
import { onBeforeUnmount, onMounted } from "vue";
import { X } from "lucide-vue-next";

defineProps({
  title: { type: String, required: true },
});

const emit = defineEmits(["close"]);

const handleKeydown = (event) => {
  if (event.key === "Escape") {
    emit("close");
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <div
    data-testid="modal-overlay"
    class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4"
    @click.self="emit('close')"
  >
    <div
      role="dialog"
      aria-modal="true"
      :aria-label="title"
      data-testid="modal-dialog"
      class="my-auto w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl"
    >
      <div class="mb-5 flex items-center justify-between gap-4">
        <h2 class="text-lg font-extrabold text-slate-900">{{ title }}</h2>
        <button
          type="button"
          data-testid="modal-close"
          aria-label="Tutup"
          class="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          @click="emit('close')"
        >
          <X class="size-5" />
        </button>
      </div>

      <slot />
    </div>
  </div>
</template>