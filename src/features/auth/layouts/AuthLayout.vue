<script setup>
import { RouterView } from "vue-router";
import { Gavel } from "lucide-vue-next";
</script>

<template>
  <div class="grid min-h-screen lg:grid-cols-2">
    <!-- Banner (hanya tampil di layar lebar) -->
    <aside
      data-testid="auth-banner"
      class="relative hidden flex-col justify-between bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 p-12 text-white lg:flex"
    >
      <div class="flex items-center gap-3">
        <div class="rounded-xl bg-white/15 p-2.5">
          <Gavel class="size-6" />
        </div>
        <span class="text-xl font-extrabold tracking-tight">Delcom Auction</span>
      </div>

      <div>
        <h2 class="text-4xl font-extrabold leading-tight">
          Temukan barang impian,<br />
          menangkan dengan penawaran terbaik.
        </h2>
        <p class="mt-4 max-w-md text-indigo-100">
          Ikuti lelang, ajukan penawaran, dan kelola barang lelangmu dalam satu
          tempat.
        </p>
      </div>

      <p class="text-sm text-indigo-200">&copy; Delcom Auction</p>
    </aside>

    <!-- Area formulir -->
    <main class="flex items-center justify-center p-6 sm:p-10">
      <div class="w-full max-w-md">
        <div class="mb-8 flex items-center gap-2 lg:hidden">
          <div class="rounded-lg bg-indigo-600 p-2 text-white">
            <Gavel class="size-5" />
          </div>
          <span class="text-lg font-extrabold">Delcom Auction</span>
        </div>

        <RouterView />
      </div>
    </main>
  </div>
</template>