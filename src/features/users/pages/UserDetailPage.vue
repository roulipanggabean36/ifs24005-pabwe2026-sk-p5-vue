<script setup>
import { onMounted } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { ArrowLeft, CalendarDays, LoaderCircle, Mail } from "lucide-vue-next";
import { formatDate } from "../../../helpers/toolsHelper";
import { useUsersStore } from "../states/usersStore";
import UserAvatar from "../components/UserAvatar.vue";

const route = useRoute();
const usersStore = useUsersStore();

onMounted(() => {
  usersStore.fetchUserById(route.params.id);
});
</script>

<template>
  <section class="mx-auto max-w-2xl">
    <RouterLink
      to="/users"
      data-testid="back-link"
      class="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:underline"
    >
      <ArrowLeft class="size-4" />
      Kembali ke direktori
    </RouterLink>

    <div
      v-if="usersStore.isUserLoading"
      data-testid="user-loading"
      class="flex items-center gap-2 text-sm text-slate-500"
    >
      <LoaderCircle class="size-4 animate-spin" />
      Memuat pengguna...
    </div>

    <div
      v-else-if="usersStore.selectedUser"
      data-testid="user-detail"
      class="flex flex-col items-center gap-5 rounded-2xl border border-slate-200 bg-white p-8 text-center sm:flex-row sm:text-left"
    >
      <UserAvatar
        :photo="usersStore.selectedUser.photo"
        :name="usersStore.selectedUser.name"
        size-class="size-24"
      />
      <div class="min-w-0 space-y-2">
        <h1 data-testid="user-name" class="text-2xl font-extrabold text-slate-900">
          {{ usersStore.selectedUser.name }}
        </h1>
        <p class="flex items-center justify-center gap-2 text-sm text-slate-600 sm:justify-start">
          <Mail class="size-4 text-slate-400" />
          <span data-testid="user-email">{{ usersStore.selectedUser.email }}</span>
        </p>
        <p class="flex items-center justify-center gap-2 text-sm text-slate-600 sm:justify-start">
          <CalendarDays class="size-4 text-slate-400" />
          <span data-testid="user-joined">
            Bergabung sejak {{ formatDate(usersStore.selectedUser.created_at) }}
          </span>
        </p>
      </div>
    </div>

    <p
      v-else
      data-testid="user-not-found"
      class="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500"
    >
      Pengguna tidak ditemukan.
    </p>
  </section>
</template>