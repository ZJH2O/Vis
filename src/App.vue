<template>
  <nav class="frosted-navbar">
    <div class="nav-logo">地震数据可视化</div>
    <ul class="nav-links">
      <li v-for="(section, index) in sections" :key="section.id">
        <a @click="scrollToSection(section.id)" :class="{ active: activeSection === section.id }">
          <span class="nav-number">{{ index + 1 }}</span>
          {{ section.title }}
        </a>
      </li>
    </ul>
  </nav>
  <div class="background-layer">
    <!-- 固定导航栏 -->
    <div class="scroll-nav axis-nav">
      <div class="nav-header">
        <!-- <h3>地震数据可视化</h3> -->
        <!-- <div class="seismic-icon">🌋</div> -->
      </div>
      <div class="axis-container">
        <div class="axis-line"></div>
        <ul>
          <li v-for="(section, index) in sections" :key="section.id">
            <a
              :class="{
                active: activeSection === section.id,
                completed: completedSections.includes(section.id)
              }"
              @click="scrollToSection(section.id)"
            >
              <span class="number">{{ index + 1 }}</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
    <Homepage />
    <div class="container">

      <!-- 世界地图区块 -->
      <div class="map-section world-section" ref="worldMap" id="world-map">
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
      <div class="map-section china-section" ref="chinaMap" id="china-map">
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
       <div class="map-section sentiment-section" ref="sentiment" id="sentiment-analysis">
        <h2 class="section-title">舆论情感分析</h2>
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

      <div class="map-section sentiment-section" ref="hotTopics" id="hot-analysis">
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

      <div class="map-section sentiment-section" ref="wordFrequency" id="word-frequency">
        <h2 class="section-title">词频统计分析</h2>
        <div class="top-row">
          <div class="emotion-block">
            <WordCloud/>
          </div>
          <div class="frequency-block">
            <WordBar/>
          </div>
        </div>
        <div class="explanation-block">
          <!-- 下方解释内容 -->
        </div>
      </div>
      <div class="map-section sentiment-section" ref="sankey" id="sankey">
        <h2 class="section-title">桑基图</h2>
        <div class="top-row">
          <div class="map-block">
            <SankeyChart/>
          </div>
        </div>
        <div class="explanation-block">
          <!-- 下方解释内容 -->
        </div>
      </div>
      <div class="footer-section">
          <AppFooter />
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import WorldMap from './components/WorldMap.vue'
import ChinaMap from './components/ChinaMap.vue'
import EarthquakeChart from './components/EarthquakeChart.vue';
import WordCloud from './components/WordCloud.vue';
import EmotionStackedChart from './components/EmotionStackedChart.vue'
import EmotionPieChart from './components/EmotionPieChart.vue'
import WordBar from './components/WordBar.vue';
import SankeyChart from './components/SankeyChart.vue';
import Homepage from './components/HomePage.vue'
import { onBeforeUnmount, onMounted, ref } from 'vue';
import AppFooter from './components/AppFooter.vue';

// 定义导航栏结构
const sections = [
  { id: 'world-map', title: '全球地震分布' },
  { id: 'china-map', title: '中国地震监测' },
  { id: 'sentiment-analysis', title: '舆论情感分析' },
  { id: 'hot-analysis', title: '相关热点分析' },
  { id: 'word-frequency', title: '词频统计分析' },
  { id: 'sankey', title: '桑基图分析' }
];

// 当前活动区块
const activeSection = ref('');
const completedSections = ref<string[]>([]);

// 区块元素ref
const worldMap = ref<HTMLElement | null>(null);
const chinaMap = ref<HTMLElement | null>(null);
const sentiment = ref<HTMLElement | null>(null);
const hotTopics = ref<HTMLElement | null>(null);
const wordFrequency = ref<HTMLElement | null>(null);
const sankey = ref<HTMLElement | null>(null);

// 观察器
let observer: IntersectionObserver | null = null;

onMounted(() => {
  // 创建IntersectionObserver
  observer = new IntersectionObserver(
    (entries) => {
      const completed = new Set(completedSections.value);

      entries.forEach(entry => {
        const sectionId = (entry.target as HTMLElement).id;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
          activeSection.value = sectionId;
        }
        if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
          completed.add(sectionId);
        }
      });

      completedSections.value = Array.from(completed);
    },
    {
      root: null,
      rootMargin: '0px',
      threshold: [0.3, 0.7]
    }
  );

  // 观察所有区块元素
  const elements = [
    worldMap.value,
    chinaMap.value,
    sentiment.value,
    hotTopics.value,
    wordFrequency.value,
    sankey.value
  ].filter(el => el !== null) as HTMLElement[];

  elements.forEach(element => observer?.observe(element));
});

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect();
  }
});

// 滚动到特定区块
function scrollToSection(sectionId: string) {
  const navbarHeight = document.querySelector('.frosted-navbar')?.clientHeight || 70;
  const element = document.getElementById(sectionId);
  if (element) {
    const topPos = element.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
    window.scrollTo({
      top: topPos, // 调整滚动位置，留出导航栏空间
      behavior: 'smooth'
    });
    activeSection.value = sectionId;
  }
}
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
      rgba(52, 77, 219, 0.215) 30px,  /* 改用半透明青蓝色 */
      rgba(52, 152, 219, 0.2) 32px
    );
  overflow: auto;

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
  overflow: visible;
}

.map-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 80vh;

  padding: 20px auto;
  border-radius: 8px;
}

/* 新增底部区域样式 */
.footer-section {
  margin-top: 60px;
  padding: 30px 0;
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

    /* 移动端底部调整 */
  .footer-section {
    margin-top: 30px;
    padding: 20px 0;
  }
}

/* 轴状侧边导航栏样式 */
.scroll-nav.axis-nav {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;
  background: rgba(255, 255, 255, 0.7); /* 半透明白色背景 */
  backdrop-filter: blur(10px); /* 磨砂模糊效果 */
  border-radius: 15px;
  padding: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.axis-nav .axis-container {
  position: relative;
  display: flex;
}

/* .axis-nav .axis-line {
  position: absolute;
  left: 30px;
  top: 0;
  height: 100%;
  width: 4px;
  background: linear-gradient(to bottom,
    rgba(121, 216, 232, 0.3),
    rgba(7, 153, 146, 0.6),
    rgba(121, 216, 232, 0.3));
  border-radius: 2px;
  z-index: 1;
} */

.axis-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
  position: relative;
  z-index: 2;
}

.axis-nav li {
  margin: 18px 0;
  position: relative;
}

.axis-nav a {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  padding: 10px 15px 10px 45px;
  border-radius: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.axis-nav a .number {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(7, 153, 146, 0.3);
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.axis-nav a .title {
  flex: 1;
  transition: all 0.3s ease;
}

.axis-nav a:hover {
  background: rgba(7, 153, 146, 0.25);
  color: white;
}

/* 当前激活区域样式 */
.axis-nav a.active {
  background: #079992;
  color: white;
  box-shadow: 0 0 15px rgba(7, 153, 146, 0.5);
}

.axis-nav a.active .number {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-50%) scale(1.1);
}

/* 已访问区块 */
.axis-nav a.completed:not(.active) {
  color: rgba(255, 255, 255, 0.9);
}

.axis-nav a.completed:not(.active) .number {
  background: rgba(121, 216, 232, 0.5);
}

/* 轴指示器效果 */
.axis-nav a.active::before {
  content: '';
  position: absolute;
  left: -5px;
  top: 50%;
  transform: translateY(-50%);
  height: 80%;
  width: 5px;
  background: #79d8e8;
  border-radius: 0 4px 4px 0;
  box-shadow: 0 0 10px #79d8e8;
  animation: axis-pulse 1.5s infinite;
}

@keyframes axis-pulse {
  0% {
    opacity: 0.7;
    box-shadow: 0 0 5px #79d8e8;
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 15px #79d8e8;
  }
  100% {
    opacity: 0.7;
    box-shadow: 0 0 5px #79d8e8;
  }
}

/* 响应式设计 - 在小屏幕上隐藏导航栏 */
@media (max-width: 992px) {
  .axis-nav {
    display: none;
  }
}

/* 磨砂白玻璃导航栏 */
.frosted-navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  z-index: 1000;

  /* 半透明磨砂白玻璃效果 */
  background: rgba(255, 255, 255, 0.7); /* 半透明白色背景 */
  backdrop-filter: blur(10px); /* 磨砂模糊效果 */
  -webkit-backdrop-filter: blur(10px); /* 兼容Safari */

  /* 边框和阴影增强效果 */
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.nav-logo {
  font-size: 1.4rem;
  font-weight: 600;
  color: #0a3d62;
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-links li {
  margin: 0 15px;
}

.nav-links a {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #0a3d62;
  font-weight: 500;
  padding: 8px 15px;
  border-radius: 20px;
  transition: all 0.3s ease;
  cursor: pointer;

}

.nav-links a:hover {
  background: rgba(7, 153, 146, 0.15);
}

.nav-links a.active {
  background: rgba(7, 153, 146, 0.25);
  color: #0a3d62;
}

.nav-number {
  background: rgba(7, 153, 146, 0.2);
  color: #0a3d62;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  margin-right: 8px;
  font-size: 0.85rem;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .frosted-navbar {
    padding: 0 20px;
  }

  .nav-links a .nav-title {
    display: none;
  }

  .nav-links a {
    padding: 8px;
  }
}
</style>


