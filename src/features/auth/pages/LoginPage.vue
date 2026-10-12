<script setup>
import { reactive, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { Eye, EyeOff, LoaderCircle, Lock, Mail } from "lucide-vue-next";
import { useInput } from "../../../hooks/useInput";
import { useAuthStore } from "../states/authStore";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const router = useRouter();
const authStore = useAuthStore();

const [email] = useInput("");
const [password] = useInput("");
const showPassword = ref(false);
const errors = reactive({ email: "", password: "" });

const validate = () => {
  if (!email.value) {
    errors.email = "Email wajib diisi";
  } else if (!EMAIL_REGEX.test(email.value)) {
    errors.email = "Format email tidak valid";
  } else {
    errors.email = "";
  }

  errors.password = password.value ? "" : "Kata sandi wajib diisi";

  return !errors.email && !errors.password;
};

const handleSubmit = async () => {
  if (!validate()) {
    return;
  }

  const success = await authStore.login({
    email: email.value,
    password: password.value,
  });

  if (success) {
    router.push("/");
  }
};
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-extrabold text-slate-900">Masuk ke akun</h1>
      <p class="mt-1 text-sm text-slate-500">
        Silakan masuk untuk mulai mengikuti lelang.
      </p>
    </div>

    <form
      class="space-y-5"
      novalidate
      data-testid="login-form"
      @submit.prevent="handleSubmit"
    >
      <div>
        <label for="login-email-input" class="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
        <div class="relative">
          <Mail class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            id="login-email-input"
            v-model="email"
            data-testid="email-input"
            type="email"
            autocomplete="email"
            placeholder="nama@email.com"
            class="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        <p v-if="errors.email" data-testid="email-error" class="mt-1 text-xs text-red-600">
          {{ errors.email }}
        </p>
      </div>

      <div>
        <label for="login-password-input" class="mb-1.5 block text-sm font-semibold text-slate-700">Kata sandi</label>
        <div class="relative">
          <Lock class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            id="login-password-input"
            v-model="password"
            data-testid="password-input"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Masukkan kata sandi"
            class="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-12 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          <button
            type="button"
            data-testid="toggle-password"
            class="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center text-slate-400 hover:text-slate-600"
            :aria-label="showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
            @click="showPassword = !showPassword"
          >
            <EyeOff v-if="showPassword" class="size-4" />
            <Eye v-else class="size-4" />
          </button>
        </div>
        <p v-if="errors.password" data-testid="password-error" class="mt-1 text-xs text-red-600">
          {{ errors.password }}
        </p>
      </div>

      <button
        type="submit"
        id="login-submit-button" data-testid="submit-button"
        :disabled="authStore.isAuthLogin"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LoaderCircle v-if="authStore.isAuthLogin" class="size-4 animate-spin" />
        {{ authStore.isAuthLogin ? "Memproses..." : "Masuk" }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-500">
      Belum punya akun?
      <RouterLink
        to="/auth/register"
        data-testid="register-link"
        class="font-bold text-indigo-600 hover:underline"
      >
        Daftar sekarang
      </RouterLink>
    </p>
  </div>
</template>