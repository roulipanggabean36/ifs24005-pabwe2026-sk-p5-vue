<script setup>
import { computed, onMounted, ref } from "vue";
import { LoaderCircle, Plus, Search, Trash2 } from "lucide-vue-next";
import { showConfirmDialog } from "../../../helpers/toolsHelper";
import { useInput } from "../../../hooks/useInput";
import { useAucationsStore } from "../states/aucationsStore";
import { isAucationClosed } from "../utils/aucationUtils";
import AucationCard from "../components/AucationCard.vue";
import AucationFormModal from "../modals/AucationFormModal.vue";

const aucationsStore = useAucationsStore();
const [keyword] = useInput("");
const scope = ref("all"); // "all" | "mine"
const status = ref("all"); // "all" | "open" | "closed"
const showForm = ref(false);

const loadAucations = () =>
  aucationsStore.fetchAucations(scope.value === "mine" ? { is_me: 1 } : {});

const changeScope = (value) => {
  scope.value = value;
  loadAucations();
};

const filteredAucations = computed(() => {
  const query = keyword.value.trim().toLowerCase();

  return aucationsStore.aucations.filter((aucation) => {
    const matchesTitle = aucation.title.toLowerCase().includes(query);
    const closed = isAucationClosed(aucation.closed_at);
    const matchesStatus =
      status.value === "all" || (status.value === "closed") === closed;

    return matchesTitle && matchesStatus;
  });
});

const tabClass = (value) => [
  "rounded-lg px-4 py-2 text-sm font-semibold transition",
  scope.value === value
    ? "bg-indigo-600 text-white"
    : "bg-white text-slate-600 hover:bg-slate-50",
];

const handleSaved = () => {
  showForm.value = false;
  loadAucations();
};

const handleDeleteAll = async () => {
  const confirmed = await showConfirmDialog(
    "Hapus semua lelang milikmu? Tindakan ini tidak dapat dibatalkan."
  );

  if (!confirmed) {
    return;
  }

  if (await aucationsStore.deleteAllAucations()) {
    loadAucations();
  }
};

onMounted(() => {
  loadAucations();
});
</script>

<template>
  <section>
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Lelang</h1>
        <p class="mt-1 text-sm text-slate-500">
          Temukan barang lelang dan ajukan penawaran terbaikmu.
        </p>
      </div>
      <button
        type="button"
        data-testid="add-button"
        class="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
        @click="showForm = true"
      >
        <Plus class="size-4" />
        Tambah lelang
      </button>
    </div>

    <div class="mb-6 flex flex-wrap items-center gap-3">
      <div class="flex gap-2 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          data-testid="scope-all"
          :class="tabClass('all')"
          @click="changeScope('all')"
        >
          Semua
        </button>
        <button
          type="button"
          data-testid="scope-mine"
          :class="tabClass('mine')"
          @click="changeScope('mine')"
        >
          Lelang saya
        </button>
      </div>

      <div class="relative min-w-52 flex-1">
        <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          v-model="keyword"
          data-testid="search-input"
          type="search"
          placeholder="Cari judul lelang"
          class="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      <select
        v-model="status"
        data-testid="status-select"
        class="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
      >
        <option value="all">Semua status</option>
        <option value="open">Dibuka</option>
        <option value="closed">Ditutup</option>
      </select>

      <button
        v-if="scope === 'mine' && aucationsStore.aucations.length > 0"
        type="button"
        data-testid="delete-all-button"
        :disabled="aucationsStore.isAucationDeleting"
        class="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        @click="handleDeleteAll"
      >
        <Trash2 class="size-4" />
        Hapus semua
      </button>
    </div>

    <div
      v-if="aucationsStore.isAucationsLoading"
      data-testid="aucations-loading"
      class="flex items-center gap-2 text-sm text-slate-500"
    >
      <LoaderCircle class="size-4 animate-spin" />
      Memuat lelang...
    </div>

    <p
      v-else-if="filteredAucations.length === 0"
      data-testid="aucations-empty"
      class="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500"
    >
      Belum ada lelang yang sesuai.
    </p>

    <ul v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="aucation in filteredAucations" :key="aucation.id">
        <AucationCard :aucation="aucation" />
      </li>
    </ul>

    <AucationFormModal
      v-if="showForm"
      @close="showForm = false"
      @saved="handleSaved"
    />
  </section>
</template>