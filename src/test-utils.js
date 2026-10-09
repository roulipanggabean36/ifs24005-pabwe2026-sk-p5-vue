import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createRouter, createMemoryHistory } from "vue-router";

/**
 * Membuat instance Pinia baru untuk test dan menjadikannya aktif.
 * @param {Object} initialState - state awal per store
 */
export function createMockPinia(initialState = {}) {
  const pinia = createPinia();
  setActivePinia(pinia);
  pinia.state.value = initialState;
  return pinia;
}

/**
 * Membuat router berbasis memory history untuk test.
 */
export function createMockRouter(routes = [], initialRoute = "/") {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: routes.length
      ? routes
      : [{ path: "/:pathMatch(.*)*", component: { template: "<div />" } }],
  });
  router.push(initialRoute);
  return router;
}

/**
 * Me-render komponen beserta Pinia dan Vue Router (memory history).
 * Selalu dipanggil dengan await.
 */
export async function renderWithProviders(component, options = {}) {
  const {
    props = {},
    slots = {},
    initialState = {},
    routes = [],
    route = "/",
    global = {},
    ...mountOptions
  } = options;

  const pinia = createMockPinia(initialState);
  const router = createMockRouter(routes, route);
  await router.isReady();

  const wrapper = mount(component, {
    props,
    slots,
    ...mountOptions,
    global: {
      ...global,
      plugins: [pinia, router, ...(global.plugins || [])],
    },
  });

  await flushPromises();

  return { wrapper, router, pinia };
}

export { flushPromises };