<template>
  <div class="about">
    <h1>This is an about page</h1>
    <p>{{counterStore.name}}</p>
    <p>{{ counterStore.cnt }}</p>
    <button @click="counterStore.increase">Increse</button>
    <button @click="Test">Test</button>
    <button @click="Test2">Test2</button>
    <button @click="Test3">Test3</button>
  </div>
</template>

<script setup lang="ts">
import { useCounterStore } from '@/stores/counter'
const counterStore = useCounterStore()
const Test = () => {
  counterStore.increase()
}
const Test2 = () => {
  counterStore.$patch((state) => {
    state.cnt = 0
    state.name = 'test'
  })
}
const Test3 = () => {
  const num:number = 100
  counterStore.changeNum(num)
}

</script>


<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
