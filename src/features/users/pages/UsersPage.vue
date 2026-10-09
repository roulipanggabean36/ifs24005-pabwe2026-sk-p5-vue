<script setup>
import { computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { LoaderCircle, Search } from "lucide-vue-next";
import { useInput } from "../../../hooks/useInput";
import { useUsersStore } from "../states/usersStore";
import UserAvatar from "../components/UserAvatar.vue";

const usersStore = useUsersStore();
const [keyword] = useInput("");

const filteredUsers = computed(() => {
  const query = keyword.value.trim().toLowerCase();

  return usersStore.users.filter(
    (user) =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
  );
});

onMounted(() => {
  usersStore.fetchUsers();
});
</script>

<template>
  <section>
    <div class="mb-6">
      <h1 class="text-2xl font-extrabold text-slate-900">Direktori Pengguna</h1>
      <p class="mt-1 text-sm text-slate-500">
        Daftar seluruh pengguna yang terdaftar di Delcom Auction.
      </p>
    </div>

    <div class="relative mb-6 max-w-md">
      <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <input
        v-model="keyword"
        data-testid="search-input"
        type="search"
        placeholder="Cari nama atau email"
        class="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
      />
    </div>

    <div
      v-if="usersStore.isUsersLoading"
      data-testid="users-loading"
      class="flex items-center gap-2 text-sm text-slate-500"
    >
      <LoaderCircle class="size-4 animate-spin" />
      Memuat pengguna...
    </div>

    <p
      v-else-if="filteredUsers.length === 0"
      data-testid="users-empty"
      class="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500"
    >
      Pengguna tidak ditemukan.
    </p>

    <ul v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="user in filteredUsers" :key="user.id">
        <RouterLink
          :to="`/users/${user.id}`"
          :data-testid="`user-card-${user.id}`"
          class="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-sm"
        >
          <UserAvatar :photo="user.photo" :name="user.name" />
          <div class="min-w-0">
            <p class="truncate font-bold text-slate-900">{{ user.name }}</p>
            <p class="truncate text-sm text-slate-500">{{ user.email }}</p>
          </div>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>