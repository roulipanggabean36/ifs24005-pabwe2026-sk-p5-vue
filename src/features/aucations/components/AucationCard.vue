<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { CalendarClock, ImageOff } from "lucide-vue-next";
import { formatDate, formatRupiah } from "../../../helpers/toolsHelper";
import UserAvatar from "../../users/components/UserAvatar.vue";
import { resolvePhotoUrl } from "../../users/utils/photoUrl";
import { normalizeDateTime } from "../utils/aucationUtils";
import AucationStatusBadge from "./AucationStatusBadge.vue";

const props = defineProps({
  aucation: { type: Object, required: true },
});

const coverUrl = computed(() => resolvePhotoUrl(props.aucation.cover));
</script>

<template>
  <RouterLink
    :to="`/aucations/${aucation.id}`"
    data-testid="aucation-card"
    class="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-indigo-300 hover:shadow-md"
  >
    <div class="relative aspect-video bg-slate-100">
      <img
        v-if="coverUrl"
        data-testid="card-cover"
        :src="coverUrl"
        :alt="aucation.title"
        class="size-full object-cover"
      />
      <div
        v-else
        data-testid="card-cover-fallback"
        class="flex size-full items-center justify-center text-slate-300"
      >
        <ImageOff class="size-10" />
      </div>
      <AucationStatusBadge
        :closed-at="aucation.closed_at"
        class="absolute right-3 top-3"
      />
    </div>

    <div class="flex flex-1 flex-col gap-3 p-4">
      <h2 data-testid="card-title" class="line-clamp-2 font-bold text-slate-900">
        {{ aucation.title }}
      </h2>

      <div class="flex items-center gap-2 text-sm text-slate-500">
        <UserAvatar
          :photo="aucation.author.photo"
          :name="aucation.author.name"
          size-class="size-6"
        />
        <span class="truncate">{{ aucation.author.name }}</span>
      </div>

      <div class="mt-auto space-y-1 text-sm">
        <p class="text-slate-500">
          Harga awal
          <span data-testid="card-start-bid" class="font-bold text-indigo-600">
            {{ formatRupiah(aucation.start_bid) }}
          </span>
        </p>
        <p data-testid="card-bids" class="text-slate-500">
          {{ aucation.bids.length }} penawaran
        </p>
        <p class="flex items-center gap-1.5 text-xs text-slate-600">
          <CalendarClock class="size-3.5" />
          <span data-testid="card-closed-at">
            {{ formatDate(normalizeDateTime(aucation.closed_at)) }}
          </span>
        </p>
      </div>
    </div>
  </RouterLink>
</template>