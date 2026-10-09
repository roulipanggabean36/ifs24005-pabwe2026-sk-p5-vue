import { createRouter, createWebHistory } from "vue-router";
import { getAccessToken } from "./helpers/apiHelper";
import AuthLayout from "./features/auth/layouts/AuthLayout.vue";

export const isLoggedIn = () => Boolean(getAccessToken());

export const routes = [
  {
    path: "/auth",
    component: AuthLayout,
    meta: { guestOnly: true },
    children: [
      { path: "login", component: () => import("./features/auth/pages/LoginPage.vue") },
      { path: "register", component: () => import("./features/auth/pages/RegisterPage.vue") },
    ],
  },
  {
    path: "/",
    component: () => import("./features/aucations/layouts/AppLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      { path: "", component: () => import("./features/aucations/pages/AucationsPage.vue") },
      { path: "aucations/:id", component: () => import("./features/aucations/pages/AucationDetailPage.vue") },
      { path: "users", component: () => import("./features/users/pages/UsersPage.vue") },
      { path: "users/:id", component: () => import("./features/users/pages/UserDetailPage.vue") },
      { path: "profile", component: () => import("./features/users/pages/ProfilePage.vue") },
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