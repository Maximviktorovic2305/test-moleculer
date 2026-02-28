import { onBeforeUnmount, ref, watch, type Ref } from "vue";

export const useDebounce = <T>(source: Ref<T>, delayMs: number): Ref<T> => {
  const debounced = ref(source.value) as Ref<T>;
  let timer: ReturnType<typeof setTimeout> | null = null;

  watch(source, (value) => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      debounced.value = value;
    }, delayMs);
  });

  onBeforeUnmount(() => {
    if (timer) {
      clearTimeout(timer);
    }
  });

  return debounced;
};
