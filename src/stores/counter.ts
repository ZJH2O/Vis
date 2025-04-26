import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const name = ref('Counter')
  const cnt = ref(0)
  const doubleCount = computed(() => cnt.value * 2)

  const increase = () => {
    cnt.value++
  }
  const changeNum = (num: number) => {
    cnt.value = num
  }

  return { name, cnt, doubleCount, increase, changeNum }
})
