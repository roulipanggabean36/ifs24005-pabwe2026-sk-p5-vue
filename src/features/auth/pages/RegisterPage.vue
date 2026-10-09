<script setup>
import { reactive, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { Eye, EyeOff, LoaderCircle, Lock, Mail, User } from "lucide-vue-next";
import { useInput } from "../../../hooks/useInput";
import { useAuthStore } from "../states/authStore";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

const router = useRouter();
const authStore = useAuthStore();

const [name] = useInput("");
const [email] = useInput("");
const [password] = useInput("");
const [confirmPassword] = useInput("");
const showPassword = ref(false);
const errors = reactive({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const validate = () => {
  errors.name = name.value.trim() ? "" : "Nama wajib diisi";

  if (!email.value) {
    errors.email = "Email wajib diisi";
  } else if (!EMAIL_REGEX.test(email.value)) {
    errors.email = "Format email tidak valid";
  } else {
    errors.email = "";
  }

  if (!password.value) {
    errors.password = "Kata sandi wajib diisi";
  } else if (password.value.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter`;
  } else {
    errors.password = "";
  }

  errors.confirmPassword =
    password.value === confirmPassword.value
      ? ""
      : "Konfirmasi kata sandi tidak sama";

  return (
    !errors.name &&
    !errors.email &&
    !errors.password &&
    !errors.confirmPassword
  );
};

const handleSubmit = async () => {
  if (!validate()) {
    return;
  }

  const success = await authStore.register({
    name: name.value.trim(),
    email: email.value,
    password: password.value,
  });

  if (success) {
    router.push("/auth/login");
  }
};
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-extrabold text-slate-900">Buat akun baru</h1>
      <p class="mt-1 text-sm text-slate-500">
        Daftar untuk mulai membuat dan mengikuti lelang.
      </p>
    </div>

    <form
      class="space-y-5"
      novalidate
      data-testid="register-form"
      @submit.prevent="handleSubmit"
    >
      <div>
        <label for="name" class="mb-1.5 block text-sm font-semibold text-slate-700">Nama lengkap</label>
        <div class="relative">
          <User class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            id="name"
            v-model="name"
            data-testid="name-input"
            type="text"
            autocomplete="name"
            placeholder="Nama lengkap"
            class="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        <p v-if="errors.name" data-testid="name-error" class="mt-1 text-xs text-red-600">
          {{ errors.name }}
        </p>
      </div>

      <div>
        <label for="email" class="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
        <div class="relative">
          <Mail class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            id="email"
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
        <label for="password" class="mb-1.5 block text-sm font-semibold text-slate-700">Kata sandi</label>
        <div class="relative">
          <Lock class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            id="password"
            v-model="password"
            data-testid="password-input"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Minimal 6 karakter"
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

      <div>
        <label for="confirmPassword" class="mb-1.5 block text-sm font-semibold text-slate-700">Konfirmasi kata sandi</label>
        <div class="relative">
          <Lock class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            data-testid="confirm-password-input"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Ulangi kata sandi"
            class="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        <p v-if="errors.confirmPassword" data-testid="confirm-password-error" class="mt-1 text-xs text-red-600">
          {{ errors.confirmPassword }}
        </p>
      </div>

      <button
        type="submit"
        data-testid="submit-button"
        :disabled="authStore.isAuthRegister"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LoaderCircle v-if="authStore.isAuthRegister" class="size-4 animate-spin" />
        {{ authStore.isAuthRegister ? "Memproses..." : "Daftar" }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-500">
      Sudah punya akun?
      <RouterLink
        to="/auth/login"
        data-testid="login-link"
        class="font-bold text-indigo-600 hover:underline"
      >
        Masuk
      </RouterLink>
    </p>
  </div>
</template>