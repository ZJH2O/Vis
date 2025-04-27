<template>
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
</template>

<script setup lang="ts">
import WorldMap from '@/components/WorldMap.vue'
import ChinaMap from '@/components/chinaMap.vue'
import EarthquakeChart from './components/EarthquakeChart.vue';
</script>

<style scoped>
/* 新增全局重置 */

.container {
  width: 80vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding: 40px;
  margin: 0 auto;
  margin-left: -200px;
  box-sizing: border-box;
}

.map-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 80vh;
  border: 1px solid #eee;
  padding: 20px auto;
  border-radius: 8px;
  overflow: hidden;
}

.top-row {
  flex: 1;
  display: flex;
  min-height: 300px;
}

.map-block {
  flex: 1;
  position: relative;
  padding: 15px;
  height: 60vh;
  min-width: 80wh;
}

.stats-block {
  flex: 1;
  padding: 20px;
  background: #f8f9fa;
  border-left: 1px solid #eee;
}

.explanation-block {
  height: 300px;
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
