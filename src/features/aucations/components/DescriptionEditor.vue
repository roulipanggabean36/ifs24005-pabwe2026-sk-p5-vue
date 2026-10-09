<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import Editor from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor.css";

const props = defineProps({
  modelValue: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue"]);

const container = ref(null);
let editor = null;

onMounted(() => {
  editor = new Editor({
    el: container.value,
    initialValue: props.modelValue,
    height: "280px",
    initialEditType: "wysiwyg",
    previewStyle: "vertical",
    usageStatistics: false,
    events: {
      change: () => emit("update:modelValue", editor.getMarkdown()),
    },
  });
});

// Sinkronkan perubahan dari luar, tanpa memicu loop dengan event change
watch(
  () => props.modelValue,
  (value) => {
    if (value !== editor.getMarkdown()) {
      editor.setMarkdown(value);
    }
  }
);

onBeforeUnmount(() => {
  editor.destroy();
  editor = null;
});
</script>

<template>
  <div ref="container" data-testid="description-editor" />
</template>