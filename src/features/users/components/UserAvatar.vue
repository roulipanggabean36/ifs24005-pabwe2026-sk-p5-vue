<script setup>
import { computed } from "vue";
import { User } from "lucide-vue-next";
import { resolvePhotoUrl } from "../utils/photoUrl";

const props = defineProps({
  photo: { type: String, default: "" },
  name: { type: String, default: "" },
  sizeClass: { type: String, default: "size-12" },
});

const src = computed(() => resolvePhotoUrl(props.photo));
</script>

<template>
  <img
    v-if="src"
    data-testid="avatar-image"
    :src="src"
    :alt="`Foto ${name}`"
    :class="['shrink-0 rounded-full object-cover', sizeClass]"
  />
  <div
    v-else
    data-testid="avatar-fallback"
    :class="[
      'flex shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600',
      sizeClass,
    ]"
  >
    <User class="size-1/2" />
  </div>
</template>