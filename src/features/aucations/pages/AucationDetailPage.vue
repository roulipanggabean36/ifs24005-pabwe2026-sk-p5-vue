<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import {
  ArrowLeft,
  ImageOff,
  LoaderCircle,
  Pencil,
  Trash2,
} from "lucide-vue-next";
import {
  formatDate,
  formatRupiah,
  showConfirmDialog,
} from "../../../helpers/toolsHelper";
import UserAvatar from "../../users/components/UserAvatar.vue";
import { useUsersStore } from "../../users/states/usersStore";
import { resolvePhotoUrl } from "../../users/utils/photoUrl";
import { useAucationsStore } from "../states/aucationsStore";
import {
  getHighestBid,
  isAucationClosed,
  normalizeDateTime,
} from "../utils/aucationUtils";
import AucationStatusBadge from "../components/AucationStatusBadge.vue";
import DescriptionViewer from "../components/DescriptionViewer.vue";
import AucationFormModal from "../modals/AucationFormModal.vue";
import BidModal from "../modals/BidModal.vue";

const route = useRoute();
const router = useRouter();
const aucationsStore = useAucationsStore();
const usersStore = useUsersStore();

const showEdit = ref(false);
const showBid = ref(false);

const aucation = computed(() => aucationsStore.aucation);
const coverUrl = computed(() => resolvePhotoUrl(aucation.value.cover));
const isOwner = computed(
  () => usersStore.profile?.id === aucation.value.user_id
);
const isClosed = computed(() => isAucationClosed(aucation.value.closed_at));
const canBid = computed(() => !isOwner.value && !isClosed.value);
const highestBid = computed(() => getHighestBid(aucation.value.bids));
const sortedBids = computed(() =>
  [...aucation.value.bids].sort((a, b) => b.bid - a.bid)
);

const refresh = () => aucationsStore.fetchAucation(route.params.id);

const handleEditSaved = () => {
  showEdit.value = false;
  refresh();
};

const handleBidSaved = () => {
  showBid.value = false;
  refresh();
};

const handleDelete = async () => {
  const confirmed = await showConfirmDialog(
    "Hapus lelang ini? Tindakan ini tidak dapat dibatalkan."
  );

  if (!confirmed) {
    return;
  }

  if (await aucationsStore.deleteAucation(aucation.value.id)) {
    router.push("/");
  }
};

const handleDeleteBid = async () => {
  const confirmed = await showConfirmDialog("Hapus tawaranmu pada lelang ini?");

  if (!confirmed) {
    return;
  }

  if (await aucationsStore.deleteBid(aucation.value.id)) {
    refresh();
  }
};

onMounted(() => {
  refresh();
  usersStore.fetchProfile();
});
</script>

<template>
  <section class="mx-auto max-w-4xl">
    <RouterLink
      to="/"
      data-testid="back-link"
      class="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:underline"
    >
      <ArrowLeft class="size-4" />
      Kembali ke daftar lelang
    </RouterLink>

    <div
      v-if="aucationsStore.isAucationLoading"
      data-testid="aucation-loading"
      class="flex items-center gap-2 text-sm text-slate-500"
    >
      <LoaderCircle class="size-4 animate-spin" />
      Memuat lelang...
    </div>

    <div
      v-else-if="aucation"
      data-testid="aucation-detail"
      class="overflow-hidden rounded-2xl border border-slate-200 bg-white"
    >
      <img
        v-if="coverUrl"
        data-testid="aucation-cover"
        :src="coverUrl"
        :alt="aucation.title"
        class="aspect-video w-full object-cover"
      />
      <div
        v-else
        data-testid="aucation-cover-fallback"
        class="flex aspect-video w-full items-center justify-center bg-slate-100 text-slate-300"
      >
        <ImageOff class="size-14" />
      </div>

      <div class="space-y-6 p-6">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0 space-y-2">
            <AucationStatusBadge :closed-at="aucation.closed_at" />
            <h1 data-testid="aucation-title" class="text-2xl font-extrabold text-slate-900">
              {{ aucation.title }}
            </h1>
            <div data-testid="aucation-author" class="flex items-center gap-2 text-sm text-slate-500">
              <UserAvatar
                :photo="aucation.author.photo"
                :name="aucation.author.name"
                size-class="size-6"
              />
              {{ aucation.author.name }}
            </div>
          </div>

          <div v-if="isOwner" class="flex gap-2">
            <button
              type="button"
              data-testid="edit-button"
              class="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              @click="showEdit = true"
            >
              <Pencil class="size-4" />
              Ubah
            </button>
            <button
              type="button"
              data-testid="delete-button"
              :disabled="aucationsStore.isAucationDeleting"
              class="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              @click="handleDelete"
            >
              <Trash2 class="size-4" />
              Hapus
            </button>
          </div>
        </div>

        <dl class="grid gap-4 sm:grid-cols-3">
          <div class="rounded-xl bg-slate-50 p-4">
            <dt class="text-xs font-semibold uppercase text-slate-400">Harga awal</dt>
            <dd data-testid="start-bid" class="mt-1 font-bold text-slate-900">
              {{ formatRupiah(aucation.start_bid) }}
            </dd>
          </div>
          <div class="rounded-xl bg-slate-50 p-4">
            <dt class="text-xs font-semibold uppercase text-slate-400">Tawaran tertinggi</dt>
            <dd data-testid="highest-bid" class="mt-1 font-bold text-indigo-600">
              {{ highestBid > 0 ? formatRupiah(highestBid) : "Belum ada tawaran" }}
            </dd>
          </div>
          <div class="rounded-xl bg-slate-50 p-4">
            <dt class="text-xs font-semibold uppercase text-slate-400">Batas waktu</dt>
            <dd data-testid="closed-at" class="mt-1 font-bold text-slate-900">
              {{ formatDate(normalizeDateTime(aucation.closed_at)) }}
            </dd>
          </div>
        </dl>

        <div>
          <h2 class="mb-2 text-lg font-bold text-slate-900">Deskripsi</h2>
          <DescriptionViewer :value="aucation.description" />
        </div>

        <div v-if="canBid" class="space-y-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
          <p v-if="aucation.my_bid" data-testid="my-bid" class="text-sm text-slate-700">
            Tawaranmu saat ini:
            <span class="font-bold">{{ formatRupiah(aucation.my_bid.bid) }}</span>
          </p>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              data-testid="bid-button"
              class="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
              @click="showBid = true"
            >
              {{ aucation.my_bid ? "Ubah tawaran" : "Beri tawaran" }}
            </button>
            <button
              v-if="aucation.my_bid"
              type="button"
              data-testid="delete-bid-button"
              :disabled="aucationsStore.isBidDeleting"
              class="rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              @click="handleDeleteBid"
            >
              Hapus tawaran
            </button>
          </div>
        </div>
        <p
          v-else-if="isClosed"
          data-testid="closed-notice"
          class="rounded-xl bg-slate-100 p-4 text-sm font-semibold text-slate-600"
        >
          Lelang telah ditutup.
        </p>

        <div>
          <h2 class="mb-2 text-lg font-bold text-slate-900">Riwayat penawaran</h2>
          <ul v-if="aucation.bids.length > 0" data-testid="bid-list" class="divide-y divide-slate-100 rounded-xl border border-slate-200">
            <li
              v-for="item in sortedBids"
              :key="item.id"
              data-testid="bid-item"
              class="flex items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <span class="font-bold text-slate-900">{{ formatRupiah(item.bid) }}</span>
              <span class="text-slate-400">{{ formatDate(item.created_at) }}</span>
            </li>
          </ul>
          <p v-else data-testid="no-bids" class="text-sm text-slate-500">
            Belum ada riwayat penawaran.
          </p>
        </div>
      </div>

      <AucationFormModal
        v-if="showEdit"
        :aucation="aucation"
        @close="showEdit = false"
        @saved="handleEditSaved"
      />
      <BidModal
        v-if="showBid"
        :aucation-id="aucation.id"
        :min-bid="aucation.start_bid"
        :initial-bid="aucation.my_bid?.bid"
        @close="showBid = false"
        @saved="handleBidSaved"
      />
    </div>

    <p
      v-else
      data-testid="aucation-not-found"
      class="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500"
    >
      Lelang tidak ditemukan.
    </p>
  </section>
</template>