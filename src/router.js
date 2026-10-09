import { createRouter, createWebHistory } from "vue-router";
import { getAccessToken } from "./helpers/apiHelper";
import AuthLayout from "./features/auth/layouts/AuthLayout.vue";
import LoginPage from "./features/auth/pages/LoginPage.vue";
import RegisterPage from "./features/auth/pages/RegisterPage.vue";
import AppLayout from "./features/aucations/layouts/AppLayout.vue";
import AucationsPage from "./features/aucations/pages/AucationsPage.vue";
import AucationDetailPage from "./features/aucations/pages/AucationDetailPage.vue";
import UsersPage from "./features/users/pages/UsersPage.vue";
import UserDetailPage from "./features/users/pages/UserDetailPage.vue";
import ProfilePage from "./features/users/pages/ProfilePage.vue";

export const isLoggedIn = () => Boolean(getAccessToken());

export const routes = [
  {
    path: "/auth",
    component: AuthLayout,
    meta: { guestOnly: true },
    children: [
      { path: "login", component: LoginPage },
      { path: "register", component: RegisterPage },
    ],
  },
  {
    path: "/",
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", component: AucationsPage },
      { path: "aucations/:id", component: AucationDetailPage },
      { path: "users", component: UsersPage },
      { path: "users/:id", component: UserDetailPage },
      { path: "profile", component: ProfilePage },
    ],
  },
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

export const authGuard = (to) => {
  if (to.meta.requiresAuth && !isLoggedIn()) {
    return "/auth/login";
  }

  if (to.meta.guestOnly && isLoggedIn()) {
    return "/";
  }

  return true;
};

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(authGuard);

export default router;