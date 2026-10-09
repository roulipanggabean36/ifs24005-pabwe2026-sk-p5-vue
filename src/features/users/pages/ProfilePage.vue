<script setup>
import { onMounted, reactive, watch } from "vue";
import { Camera, LoaderCircle, Lock, Mail, User } from "lucide-vue-next";
import { formatDate } from "../../../helpers/toolsHelper";
import { useInput } from "../../../hooks/useInput";
import { useUsersStore } from "../states/usersStore";
import UserAvatar from "../components/UserAvatar.vue";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

const usersStore = useUsersStore();

const [name] = useInput("");
const [email] = useInput("");
const [currentPassword, , resetCurrentPassword] = useInput("");
const [newPassword, , resetNewPassword] = useInput("");
const [confirmPassword, , resetConfirmPassword] = useInput("");

const profileErrors = reactive({ name: "", email: "" });
const passwordErrors = reactive({ current: "", next: "", confirm: "" });

// Isi form dengan data profil setiap kali profil dimuat/diperbarui
watch(
  () => usersStore.profile,
  (profile) => {
    if (profile) {
      name.value = profile.name;
      email.value = profile.email;
    }
  },
  { immediate: true }
);

onMounted(() => {
  usersStore.fetchProfile();
});

const validateProfile = () => {
  profileErrors.name = name.value.trim() ? "" : "Nama wajib diisi";

  if (!email.value) {
    profileErrors.email = "Email wajib diisi";
  } else if (!EMAIL_REGEX.test(email.value)) {
    profileErrors.email = "Format email tidak valid";
  } else {
    profileErrors.email = "";
  }

  return !profileErrors.name && !profileErrors.email;
};

const validatePassword = () => {
  passwordErrors.current = currentPassword.value
    ? ""
    : "Kata sandi saat ini wajib diisi";

  if (!newPassword.value) {
    passwordErrors.next = "Kata sandi baru wajib diisi";
  } else if (newPassword.value.length < MIN_PASSWORD_LENGTH) {
    passwordErrors.next = `Kata sandi baru minimal ${MIN_PASSWORD_LENGTH} karakter`;
  } else {
    passwordErrors.next = "";
  }

  passwordErrors.confirm =
    newPassword.value === confirmPassword.value
      ? ""
      : "Konfirmasi kata sandi tidak sama";

  return (
    !passwordErrors.current && !passwordErrors.next && !passwordErrors.confirm
  );
};

const handleProfileSubmit = async () => {
  if (!validateProfile()) {
    return;
  }

  await usersStore.updateProfile({
    name: name.value.trim(),
    email: email.value,
  });
};

const handlePasswordSubmit = async () => {
  if (!validatePassword()) {
    return;
  }

  const success = await usersStore.updatePassword({
    password: currentPassword.value,
    newPassword: newPassword.value,
    newPasswordConfirmation: confirmPassword.value,
  });

  if (success) {
    resetCurrentPassword();
    resetNewPassword();
    resetConfirmPassword();
  }
};

const handlePhotoChange = async (event) => {
  const input = event.target;
  const [file] = input.files;

  if (!file) {
    return;
  }

  await usersStore.updatePhoto(file);
  input.value = "";
};
</script>

<template>
  <section class="mx-auto max-w-3xl">
    <div v-if="usersStore.profile" class="space-y-6">
      <!-- Ringkasan profil + ubah foto -->
      <div class="flex flex-col items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row">
        <UserAvatar
          :photo="usersStore.profile.photo"
          :name="usersStore.profile.name"
          size-class="size-24"
        />
        <div class="min-w-0 flex-1 text-center sm:text-left">
          <h1 data-testid="profile-name" class="truncate text-xl font-extrabold text-slate-900">
            {{ usersStore.profile.name }}
          </h1>
          <p data-testid="profile-email" class="truncate text-sm text-slate-500">
            {{ usersStore.profile.email }}
          </p>
          <p data-testid="profile-joined" class="mt-1 text-xs text-slate-400">
            Bergabung sejak {{ formatDate(usersStore.profile.created_at) }}
          </p>
        </div>
        <div>
          <label
            for="photo"
            data-testid="photo-label"
            class="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Camera class="size-4" />
            {{ usersStore.isPhotoUpdating ? "Mengunggah..." : "Ubah foto" }}
          </label>
          <input
            id="photo"
            data-testid="photo-input"
            type="file"
            accept="image/*"
            class="sr-only"
            :disabled="usersStore.isPhotoUpdating"
            @change="handlePhotoChange"
          />
        </div>
      </div>

      <!-- Form informasi akun -->
      <form
        class="space-y-5 rounded-2xl border border-slate-200 bg-white p-6"
        novalidate
        data-testid="profile-form"
        @submit.prevent="handleProfileSubmit"
      >
        <h2 class="text-lg font-bold text-slate-900">Informasi akun</h2>

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
              class="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <p v-if="profileErrors.name" data-testid="name-error" class="mt-1 text-xs text-red-600">
            {{ profileErrors.name }}
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
              class="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <p v-if="profileErrors.email" data-testid="email-error" class="mt-1 text-xs text-red-600">
            {{ profileErrors.email }}
          </p>
        </div>

        <button
          type="submit"
          data-testid="profile-submit"
          :disabled="usersStore.isProfileUpdating"
          class="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LoaderCircle v-if="usersStore.isProfileUpdating" class="size-4 animate-spin" />
          {{ usersStore.isProfileUpdating ? "Menyimpan..." : "Simpan perubahan" }}
        </button>
      </form>

      <!-- Form ubah kata sandi -->
      <form
        class="space-y-5 rounded-2xl border border-slate-200 bg-white p-6"
        novalidate
        data-testid="password-form"
        @submit.prevent="handlePasswordSubmit"
      >
        <h2 class="text-lg font-bold text-slate-900">Ubah kata sandi</h2>

        <div>
          <label for="currentPassword" class="mb-1.5 block text-sm font-semibold text-slate-700">Kata sandi saat ini</label>
          <div class="relative">
            <Lock class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              id="currentPassword"
              v-model="currentPassword"
              data-testid="current-password-input"
              type="password"
              autocomplete="current-password"
              class="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <p v-if="passwordErrors.current" data-testid="current-password-error" class="mt-1 text-xs text-red-600">
            {{ passwordErrors.current }}
          </p>
        </div>

        <div>
          <label for="newPassword" class="mb-1.5 block text-sm font-semibold text-slate-700">Kata sandi baru</label>
          <div class="relative">
            <Lock class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              id="newPassword"
              v-model="newPassword"
              data-testid="new-password-input"
              type="password"
              autocomplete="new-password"
              placeholder="Minimal 6 karakter"
              class="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <p v-if="passwordErrors.next" data-testid="new-password-error" class="mt-1 text-xs text-red-600">
            {{ passwordErrors.next }}
          </p>
        </div>

        <div>
          <label for="confirmPassword" class="mb-1.5 block text-sm font-semibold text-slate-700">Konfirmasi kata sandi baru</label>
          <div class="relative">
            <Lock class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              data-testid="confirm-password-input"
              type="password"
              autocomplete="new-password"
              class="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <p v-if="passwordErrors.confirm" data-testid="confirm-password-error" class="mt-1 text-xs text-red-600">
            {{ passwordErrors.confirm }}
          </p>
        </div>

        <button
          type="submit"
          data-testid="password-submit"
          :disabled="usersStore.isPasswordUpdating"
          class="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LoaderCircle v-if="usersStore.isPasswordUpdating" class="size-4 animate-spin" />
          {{ usersStore.isPasswordUpdating ? "Memproses..." : "Ubah kata sandi" }}
        </button>
      </form>
    </div>

    <div
      v-else-if="usersStore.isProfileLoading"
      data-testid="profile-loading"
      class="flex items-center gap-2 text-sm text-slate-500"
    >
      <LoaderCircle class="size-4 animate-spin" />
      Memuat profil...
    </div>

    <p
      v-else
      data-testid="profile-error"
      class="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500"
    >
      Profil tidak dapat dimuat.
    </p>
  </section>
</template>