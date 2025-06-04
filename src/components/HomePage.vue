<template>
  <div class="parallax-container">
    <!-- 视差滚动层 -->
    <div
      class="parallax-layer layer3"
      :style="`transform: translateY(${scrollPosition *0}px)`"
    ></div>
    <div
      class="parallax-layer layer2"
      :style="`transform: translateY(${scrollPosition*0 }px)`"
    ></div>
    <div
      class="parallax-layer layer1"
      :style="`transform: translateY(${scrollPosition*0 }px)`"
    ></div>

    <!-- 艺术字标题 -->
    <h1 class="artistic-title">
      <span class="title-text">Earthquake</span>
      <span class="title-text gold-text">Vis</span>
    </h1>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const scrollPosition = ref(0);

const handleScroll = () => {
  scrollPosition.value = window.scrollY;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.parallax-container {
  height: 70vh;
  position: relative;
  overflow: hidden;
  background: #f5f5f5;
}

.parallax-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: transform 0.1s ease-out;
  background-repeat: no-repeat;
}

.layer1 {
  background-image: url('@/assets/img/4.webp');
  z-index: 3;
  clip-path: polygon(0 0, 100% 0, 100% 40%, 0 50%);
  top: -15%;
  opacity: 1;
  filter: grayscale(80%);
}

.layer2 {
  background-image: url('@/assets/img/2.jpg');
  z-index: 2;
  background-position: 40% 50%;
  clip-path: polygon(0 0, 100% 0%, 100% 80%, 0 70%);
  /* mix-blend-mode: multiply; */
  top: -5%;
}

.layer3 {
  background-image: url('@/assets/img/3.jpg');
  z-index: 1;
  transform: scale(1.1);
  filter: grayscale(80%);
}

.title-container {
  position: fixed;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 4;
  text-align: center;
}

.artistic-title {
  position: absolute;
  top: 80%;
  left: 20%;
  transform: translate(-50%, -50%);
  z-index: 4;
  text-align: center;
  font-family: 'Abril Fatface', cursive;
  font-weight: 700;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.4);
}

.title-text {
  display: block;
  font-size: 4.5rem;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.1;
  letter-spacing: 2px;
}

.gold-text {
  color: #ffd700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}


</style>
