<script setup>
import { RouterLink, RouterView, useRouter } from "vue-router";
import { Gavel, LogOut } from "lucide-vue-next";
import { showConfirmDialog } from "../../../helpers/toolsHelper";
import { useAuthStore } from "../../auth/states/authStore";

const links = [
  { to: "/", label: "Lelang", testId: "nav-aucations" },
  { to: "/users", label: "Pengguna", testId: "nav-users" },
  { to: "/profile", label: "Profil", testId: "nav-profile" },
];

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = async () => {
  const confirmed = await showConfirmDialog("Yakin ingin keluar dari akun?");

  if (!confirmed) {
    return;
  }

  await authStore.logout();
  router.push("/auth/login");
};
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <RouterLink to="/" class="flex items-center gap-2">
          <div class="rounded-lg bg-indigo-600 p-2 text-white">
            <Gavel class="size-5" />
          </div>
          <span class="text-lg font-extrabold text-slate-900">Delcom Auction</span>
        </RouterLink>

        <nav class="flex flex-wrap items-center gap-1">
          <RouterLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            :data-testid="link.testId"
            active-class="bg-indigo-50 text-indigo-700"
            class="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            {{ link.label }}
          </RouterLink>

          <button
            type="button"
            data-testid="logout-button"
            class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            @click="handleLogout"
          >
            <LogOut class="size-4" />
            Keluar
          </button>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-8">
      <h1 class="sr-only">Delcom Auction - Aplikasi Lelang</h1>
      <RouterView />
    </main>
  </div>
</template>