<template>
  <div class="background-layer">
    <div class="container">
      <!-- 世界地图区块 -->
      <div class="map-section world-section">
        <div class="top-row">
          <div class="map-block">
            <WorldMap />
          </div>
          <div class="stats-block">
            <!-- 右侧统计内容 -->
          </div>
        </div>
        <div class="explanation-block">
          <!-- 下方解释内容 -->
        </div>
      </div>

      <!-- 中国地图区块 -->
      <div class="map-section china-section">
        <div class="top-row">
          <div class="map-block">
            <ChinaMap />
          </div>
          <div class="stats-block">
            <EarthquakeChart />
            <!-- 右侧统计内容 -->
          </div>
        </div>
        <div class="explanation-block">
          <!-- 下方解释内容 -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import WorldMap from '@/components/WorldMap.vue'
import ChinaMap from '@/components/chinaMap.vue'
import EarthquakeChart from './components/EarthquakeChart.vue';
</script>

<style scoped>
html, body {
  overflow: auto;
  height: 100%;
}
.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 100%;
  z-index: 0;
  background:
    /* 深海蓝渐变基底 */
    linear-gradient(160deg, #0a3d62 0%, #079992 100%),
    /* 青蓝色断层线 */
    repeating-linear-gradient(
      -15deg,
      transparent,
      transparent 30px,
      rgba(52, 152, 219, 0.2) 30px,  /* 改用半透明青蓝色 */
      rgba(52, 152, 219, 0.2) 32px
    );


}

/*容器样式*/
.container {
  position: relative; /* 确保在背景层上方 */
  z-index: 1;
  width: 90vw;
  min-height: 120vh;
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding: 40px;
  margin: 0 auto;
  box-sizing: border-box;
}

.map-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 80vh;

  padding: 20px auto;
  border-radius: 8px;
}

.top-row {
  flex: 1;
  display: flex;
  min-height: 300px;
}

.map-block {
  flex: 1;
  background-color: white;
  position: relative;
  padding: 30px 10px;;
  min-height: 500px;
  min-width: 80wh;
}

.stats-block {
  flex: 1;
  padding: 20px 40px;
  background: #f8f9fa;
  border-left: 1px solid #eee;
}


.explanation-block {
  height: 200px;
  padding: 15px;
  background: #f1f3f5;
  border-top: 1px solid #eee;
}



/* 响应式处理 */
@media (max-width: 768px) {
  .top-row {
    flex-direction: column;
  }

  .map-block {
    min-width: auto;
    height: 400px;
  }

  .stats-block {
    border-left: none;
    border-top: 1px solid #eee;
  }
}
</style>
