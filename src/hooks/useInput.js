import { ref } from "vue";

/**
 * Composable untuk mengelola state input form.
 *
 * Contoh:
 *   const [title, onTitleChange, resetTitle] = useInput("");
 *   <input v-model="title" />          // two-way binding
 *   <input :value="title" @input="onTitleChange" />
 *
 * @param {string} [initialValue=""]
 * @returns {[import("vue").Ref<string>, (event: Event) => void, () => void]}
 */
export function useInput(initialValue = "") {
  const value = ref(initialValue);

  const onChange = (event) => {
    value.value = event.target.value;
  };

  const reset = () => {
    value.value = initialValue;
  };

  return [value, onChange, reset];
}