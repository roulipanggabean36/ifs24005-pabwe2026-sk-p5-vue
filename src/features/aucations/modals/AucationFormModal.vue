<script setup>
import { computed, reactive, ref } from "vue";
import { LoaderCircle } from "lucide-vue-next";
import { useInput } from "../../../hooks/useInput";
import { useAucationsStore } from "../states/aucationsStore";
import { toApiDateTime, toInputDateTime } from "../utils/aucationUtils";
import BaseModal from "../components/BaseModal.vue";
import DescriptionEditor from "../components/DescriptionEditor.vue";

const props = defineProps({
  // null = mode tambah, object lelang = mode ubah
  aucation: { type: Object, default: null },
});

const emit = defineEmits(["close", "saved"]);

const aucationsStore = useAucationsStore();
const isEdit = computed(() => props.aucation !== null);

const source = props.aucation ?? {
  title: "",
  description: "",
  start_bid: "",
  closed_at: "",
};

const [title] = useInput(source.title);
const [description] = useInput(source.description);
const [startBid] = useInput(source.start_bid);
const [closedAt] = useInput(toInputDateTime(source.closed_at));
const coverFile = ref(null);

const errors = reactive({
  title: "",
  description: "",
  startBid: "",
  closedAt: "",
});

const validate = () => {
  errors.title = title.value.trim() ? "" : "Judul wajib diisi";
  errors.description = description.value.trim() ? "" : "Deskripsi wajib diisi";

  if (startBid.value === "") {
    errors.startBid = "Harga awal wajib diisi";
  } else if (Number(startBid.value) <= 0) {
    errors.startBid = "Harga awal harus lebih dari 0";
  } else {
    errors.startBid = "";
  }

  if (!closedAt.value) {
    errors.closedAt = "Batas waktu wajib diisi";
  } else if (new Date(closedAt.value).getTime() <= Date.now()) {
    errors.closedAt = "Batas waktu harus di masa depan";
  } else {
    errors.closedAt = "";
  }

  return (
    !errors.title && !errors.description && !errors.startBid && !errors.closedAt
  );
};

const handleCoverChange = (event) => {
  coverFile.value = event.target.files[0] ?? null;
};

const handleSubmit = async () => {
  if (!validate()) {
    return;
  }

  const payload = {
    title: title.value.trim(),
    description: description.value,
    startBid: Number(startBid.value),
    closedAt: toApiDateTime(closedAt.value),
    cover: coverFile.value,
  };

  const success = isEdit.value
    ? await aucationsStore.updateAucation(props.aucation.id, payload)
    : await aucationsStore.createAucation(payload);

  if (!success) {
    return;
  }

  emit("saved");
};
</script>

<template>
  <BaseModal :title="isEdit ? 'Ubah lelang' : 'Tambah lelang'" @close="emit('close')">
    <form
      novalidate
      data-testid="aucation-form"
      class="space-y-5"
      @submit.prevent="handleSubmit"
    >
      <div>
        <label for="title" class="mb-1.5 block text-sm font-semibold text-slate-700">Judul</label>
        <input
          id="title"
          v-model="title"
          data-testid="title-input"
          type="text"
          placeholder="Nama barang lelang"
          class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
        <p v-if="errors.title" data-testid="title-error" class="mt-1 text-xs text-red-600">
          {{ errors.title }}
        </p>
      </div>

      <div>
        <span class="mb-1.5 block text-sm font-semibold text-slate-700">Deskripsi</span>
        <DescriptionEditor v-model="description" />
        <p v-if="errors.description" data-testid="description-error" class="mt-1 text-xs text-red-600">
          {{ errors.description }}
        </p>
      </div>

      <div class="grid gap-5 sm:grid-cols-2">
        <div>
          <label for="startBid" class="mb-1.5 block text-sm font-semibold text-slate-700">Harga awal (Rp)</label>
          <input
            id="startBid"
            v-model="startBid"
            data-testid="start-bid-input"
            type="number"
            min="0"
            class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          <p v-if="errors.startBid" data-testid="start-bid-error" class="mt-1 text-xs text-red-600">
            {{ errors.startBid }}
          </p>
        </div>

        <div>
          <label for="closedAt" class="mb-1.5 block text-sm font-semibold text-slate-700">Batas waktu</label>
          <input
            id="closedAt"
            v-model="closedAt"
            data-testid="closed-at-input"
            type="datetime-local"
            class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          <p v-if="errors.closedAt" data-testid="closed-at-error" class="mt-1 text-xs text-red-600">
            {{ errors.closedAt }}
          </p>
        </div>
      </div>

      <div>
        <label for="cover" class="mb-1.5 block text-sm font-semibold text-slate-700">Cover (opsional)</label>
        <input
          id="cover"
          data-testid="cover-input"
          type="file"
          accept="image/jpeg,image/png"
          class="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:font-semibold file:text-indigo-700"
          @change="handleCoverChange"
        />
      </div>

      <div class="flex justify-end gap-3">
        <button
          type="button"
          data-testid="cancel-button"
          class="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          @click="emit('close')"
        >
          Batal
        </button>
        <button
          type="submit"
          data-testid="submit-button"
          :disabled="aucationsStore.isAucationSaving"
          class="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LoaderCircle v-if="aucationsStore.isAucationSaving" class="size-4 animate-spin" />
          {{ aucationsStore.isAucationSaving ? "Menyimpan..." : "Simpan" }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>