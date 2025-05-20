<template>
  <div class="background-layer">
    <div class="container">

      <!-- 首页区块 -->
      <div class="map-section">
        <div class="top-row">
          <div class="home-block">
            <!-- 主视觉内容占位 -->
          </div>
        </div>
      </div>

      <!-- 世界地图区块 -->
      <div class="map-section world-section">
        <h2 class="section-title">全球地震分布</h2>
        <div class="top-row">
          <div class="map-block">
            <WorldMap />
          </div>
          <!-- <div class="stats-block">
            <WordCloud/>
          </div> -->
        </div>
        <div class="explanation-block">
          <!-- 下方解释内容 -->

        </div>
      </div>

      <!-- 中国地图区块 -->
      <div class="map-section china-section">
        <h2 class="section-title">中国地震监测</h2>
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

       <!-- 新增情感分析区块 -->
       <div class="map-section sentiment-section">
        <h2 class="section-title">舆情情感分析</h2>
        <div class="top-row">
          <div class="emotion-block">
            <EmotionStackedChart />

          </div>
          <div class="frequency-block">

          </div>
        </div>
        <div class="explanation-block">
          <!-- 下方解释内容 -->
        </div>
      </div>

      <div class="map-section sentiment-section">
        <h2 class="section-title">相关热点分析</h2>
        <div class="top-row">
          <div class="emotion-block">
            <EmotionPieChart/>
          </div>
          <div class="frequency-block">
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
import ChinaMap from '@/components/ChinaMap.vue'
import EarthquakeChart from './components/EarthquakeChart.vue';
import WordCloud from './components/WordCloud.vue';
import EmotionStackedChart from '@/components/EmotionStackedChart.vue'
import EmotionPieChart from '@/components/EmotionPieChart.vue'

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


.emotion-block,
.frequency-block {
  flex: 1;
  background: white;
  padding: 50px;
  min-height: 400px;
  max-height: 700px;
  max-width: 1000px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .sentiment-section .top-row {
    flex-direction: column;
  }

  .emotion-block,
  .frequency-block {
    width: 100%;
    min-height: 300px;
  }

  .emotion-block {
    margin-bottom: 15px;
  }
}

/* 新增标题样式 */
.section-title {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.8rem;
  margin: 60px 0 30px;
  padding-left: 20px;
  position: relative;
}

/* 添加标题装饰线 */
.section-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  height: 60%;
  width: 4px;
  background: #079992;
  transform: translateY(-50%);
}

/* 调整区块间距 */
.map-section {
  margin: 40px 0;
  position: relative;
}

/* 首屏特殊间距 */
.home-section {
  margin-top: 20px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .section-title {
    font-size: 1.5rem;
    margin: 40px 0 20px;
  }

  /* 缩小移动端间距 */
  .map-section {
    margin: 30px 0;
  }
}
</style>


