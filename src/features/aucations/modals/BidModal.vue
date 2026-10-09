<script setup>
import { ref } from "vue";
import { LoaderCircle } from "lucide-vue-next";
import { formatRupiah } from "../../../helpers/toolsHelper";
import { useInput } from "../../../hooks/useInput";
import { useAucationsStore } from "../states/aucationsStore";
import BaseModal from "../components/BaseModal.vue";

const props = defineProps({
  aucationId: { type: Number, required: true },
  minBid: { type: Number, required: true },
  initialBid: { type: Number, default: 0 },
});

const emit = defineEmits(["close", "saved"]);

const aucationsStore = useAucationsStore();
const [bid] = useInput(props.initialBid || "");
const error = ref("");

const validate = () => {
  if (bid.value === "") {
    error.value = "Nominal tawaran wajib diisi";
  } else if (Number(bid.value) < props.minBid) {
    error.value = `Tawaran minimal ${formatRupiah(props.minBid)}`;
  } else {
    error.value = "";
  }

  return !error.value;
};

const handleSubmit = async () => {
  if (!validate()) {
    return;
  }

  const success = await aucationsStore.placeBid(
    props.aucationId,
    Number(bid.value)
  );

  if (success) {
    emit("saved");
  }
};
</script>

<template>
  <BaseModal title="Beri tawaran" @close="emit('close')">
    <form
      novalidate
      data-testid="bid-form"
      class="space-y-5"
      @submit.prevent="handleSubmit"
    >
      <div>
        <label for="bid" class="mb-1.5 block text-sm font-semibold text-slate-700">
          Nominal tawaran (Rp)
        </label>
        <input
          id="bid"
          v-model="bid"
          data-testid="bid-input"
          type="number"
          min="0"
          class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
        <p class="mt-1 text-xs text-slate-400">
          Tawaran minimal {{ formatRupiah(minBid) }}
        </p>
        <p v-if="error" data-testid="bid-error" class="mt-1 text-xs text-red-600">
          {{ error }}
        </p>
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
          :disabled="aucationsStore.isBidSaving"
          class="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LoaderCircle v-if="aucationsStore.isBidSaving" class="size-4 animate-spin" />
          {{ aucationsStore.isBidSaving ? "Mengirim..." : "Kirim tawaran" }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>