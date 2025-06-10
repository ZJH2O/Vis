<template>
  <nav class="frosted-navbar">
    <div class="nav-logo">震势·多维——地震数据可视化</div>
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
      <div class="map-section world-section"  ref="worldMap" id="world-map">
        <h2 class="section-title">全球地震分布</h2>
        <div class="top-row">
          <div class="map-block">
            <WorldMap />
          </div>
        </div>
        <div class="explanation-block">
          <p class="description-text">
            全球7级以上强震的时空分布规律是理解地球板块运动的重要窗口。本视图集中展示2005-2025年间全球强震分布特征，通过三重视觉编码体系：外环直径映射震级强度，震级越大影响范围即直径越大，内圈色阶表示震源深度，由浅至深采用红至色谱（研究表明浅源地震对于人类的危害更大），点透明度标记时间远近，近年事件更鲜明。用户可通过地图交互探查区域细节，如环太平洋地震带的深源地震簇。这种多维表达既助力研究机构识别板块俯冲带的地震活动模式，完善灾害预警模型；也为公众建立居住地邻区的地震风险认知提供直观参照，强化防灾意识。
          </p>
        </div>
      </div>

      <!-- 中国地图区块 -->
      <div class="map-section china-section"  ref="chinaMap" id="china-map">
        <h2 class="section-title">中国地震监测</h2>
        <div class="top-row">
          <div class="map-block">
            <ChinaMap />
          </div>
          <div class="stats-block">
            <EarthquakeChart />
          </div>
        </div>
        <div class="explanation-block">
          <p class="description-text">
            中国地域辽阔且地质构造复杂，不同省份面临的地震风险存在显著差异。为精准解析区域地震活动性特征，本视图构建省级尺度的双模型联动分析平台：左侧热力地图以色阶梯度，颜色越深表示地震次数越多，呈现各省历史地震累计频次，直观揭示西北、西南等高风险聚集区；选定特定省份后，右侧双轴图表同步展示该区域地震频次与平均释放能量水平年度演变趋势。这种空间分布与时间序列的耦合分析，既为地震科研机构提供板块应力释放模式的地域分异证据，也助力应急管理部门优化省级抗震资源配置，公众亦可藉此建立对所在地区地震活动性的客观认知。
          </p>
        </div>
      </div>
      <div class="map-section sentiment-section" ref="sankey" id="sankey">
        <h2 class="section-title">情感分布分析</h2>
        <div class="top-row">
          <div class="map-block">
            <SankeyChart />
          </div>
        </div>
        <div class="explanation-block">
          <p class="description-text">
            地震灾害后的公众情感响应构成复杂系统化认知体系，传统单维分析难以揭示其内在结构关联。本视图集成桑基图、饼图与柱状图的协同分析框架，聚焦整体情感状态的静态结构：​​桑基图​​以节点映射不同情感状态类别，边宽精确量化各类状态间潜在的互动与转化强度，直观揭示情感状态网络中的核心连接路径；​​饼图​​通过径向分割，清晰呈现当下情感整体的比例构成，扇形面积精确表征各类状态在整个情感系统中的结构权重；​​柱状图​​则定量展示饼图中各类情感状态对应的具体数量规模，与桑基图的关联结构分析形成相互验证。该协同模型使应急管理部门能够识别情感网络中的关键枢纽节点及其关系强度，据此制定精准干预策略以阻断负面情绪的连锁传递。
          </p>
        </div>
      </div>
      <!-- 新增情感分析区块 -->
      <div class="map-section sentiment-section" ref="sentiment" id="sentiment-analysis">
        <h2 class="section-title">实时舆情分析</h2>
        <div class="top-row">
          <div class="emotion-block">
            <EmotionStackedChart />
          </div>
          <div class="stats-block">
          </div>
        </div>
        <div class="explanation-block">
          <p class="description-text">
            地震事件引发的公众情感响应具有高度动态性，精准捕捉此类情绪波动对灾害应急管理至关重要。针对地震舆情的复杂情感结构，本视图通过时序堆叠图与旭日图的协同分析实现深度解构：堆叠面积图纵轴按时间序列呈现积极、消极、中性三大基础情感构成的比例波动，清晰捕捉不同事件节点引发的群体情绪转折；旭日图则通过环形层级拓展，细化解析各基础情感类别中的衍生情绪谱系。这种'宏观趋势+微观结构'的双重视角，使应急管理部门能够实时诊断社会情绪状态，精确制定信息发布策略，同步支撑跨区域情感差异分析。其核心价值在于建立灾害响应周期内的群体心理变化模型，为灾情沟通机制的动态优化提供数据驱动的决策框架。
          </p>
        </div>
      </div>

      <div class="map-section sentiment-section" ref="hotTopics" id="hot-analysis">
        <h2 class="section-title">相关热点分析</h2>
        <div class="top-row">
          <div class="emotion-block">
            <EmotionPieChart />
          </div>
          <div class="stats-block">
          </div>
        </div>
        <div class="explanation-block">
          <p class="description-text">
            面对地震事件衍生的海量舆情信息，快速识别社会关注焦点及其情感属性构成具有重要决策价值。本视图通过气泡图追踪地震发生后不同时间段的热点及热点反映的公众情感状况。饼状图则通过点击气泡图中的单个气泡，显示某一时段内的具体的多条热点信息的点赞和转发情况。这种双维可视化机制使媒体机构可实时捕捉当前公共讨论的核心关切方向，从而定向响应焦点议题；同时为政府部门提供社会心理态势的量化感知，支撑政策措施的精准制定。通过时段对比分析，还能揭示灾后不同阶段热点迁移路径，为建立舆情引导的动态响应模型提供关键数据支持。
          </p>
        </div>
      </div>

      <div class="map-section sentiment-section" ref="wordFrequency" id="word-frequency">
        <h2 class="section-title">词频统计分析</h2>
        <div class="top-row">
          <div class="emotion-block">
            <WordCloud />
          </div>
          <div class="frequency-block">
            <WordBar />
          </div>
        </div>
        <div class="explanation-block">
          <p class="description-text">
            当地震事件发生时，相关新闻报道和公众讨论会迅速生成海量文本信息，有效提取这些文本中的核心话题与演变趋势至关重要。为此，本视图综合运用词频统计分析方法：左侧词云图结合柱状图直观展现了不同时间段内的高频关键词汇——字体大小精确映射其出现频次，清晰揭示当前舆论的核心焦点；右侧柱状图则追踪各关键词在灾害周期不同阶段的热度演变轨迹。这种多维度可视化协同揭示公众关注的动态迁移规律，既为研究人员提供分析舆论焦点演化的量化依据，也辅助相关部门精准把握社会关切的演变节点，优化信息发布策略，提升应急沟通的时效性与精准度。
        </p>
        </div>
      </div>

      <div class="footer-section" ref="co" id="co">
        <h2 class="section-title">团队合作</h2>
          <AppFooter />
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import WorldMap from '@/components/WorldMap.vue'
import ChinaMap from '@/components/ChinaMap.vue'
import EarthquakeChart from '@/components/EarthquakeChart.vue';
import WordCloud from '@/components/WordCloud.vue';
import EmotionStackedChart from '@/components/EmotionStackedChart.vue'
import EmotionPieChart from '@/components/EmotionPieChart.vue'
import WordBar from '@/components/WordBar.vue';
import SankeyChart from '@/components/SankeyChart.vue';
import Homepage from '@/components/HomePage.vue'
import { onBeforeUnmount, onMounted, ref } from 'vue';
import AppFooter from '@/components/AppFooter.vue';

// 定义导航栏结构
const sections = [
  { id: 'world-map', title: '全球地震分布' },
  { id: 'china-map', title: '中国地震监测' },
  { id: 'sankey', title: '情感分布分析' },
  { id: 'sentiment-analysis', title: '实时舆情分析' },
  { id: 'hot-analysis', title: '相关热点分析' },
  { id: 'word-frequency', title: '词频统计分析' },
  { id: 'co', title: '团队合作'}
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
const co = ref<HTMLElement|null>(null);
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
    sankey.value,
    sentiment.value,
    hotTopics.value,
    wordFrequency.value,
    co.value,
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
  top: 70px;
  /* top: 0; */
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
  overflow: hidden;
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
  background: #ffffff;
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
  padding: 8px 8px;
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

/* 新增描述文本样式 */
.description-text {
  color: #ffffff;
  font-size: 1.05rem;
  line-height: 1.8;
  text-align: justify;
  padding: 20px;
  transition: all 0.3s ease;
}

/* 首行缩进 */
.description-text::first-letter {
  margin-left: 2em;
}

/* 调整区块背景 */
.explanation-block {
  height: 200px;
  background: rgba(241, 243, 245, 0.393); /* 半透明背景 */
  border-top: 1px solid rgba(238, 238, 238, 0.5);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .description-text {
    padding: 15px;
    font-size: 0.95rem;
    line-height: 1.7;
  }

  .explanation-block {
    height: auto; /* 自适应高度 */
  }
}
@media screen and (max-width: 1200px) {
  .container {
    width: 95vw;
    padding: 30px;
  }

  .section-title {
    font-size: 1.6rem;
    margin: 40px 0 20px;
  }
}

@media screen and (max-width: 992px) {
  /* 移动端隐藏侧边导航栏 */
  .scroll-nav.axis-nav {
    display: none;
  }

  /* 调整导航栏布局 */
  .frosted-navbar {
    padding: 0 20px;
    height: 60px;
  }

  .nav-logo {
    font-size: 1.2rem;
  }
}

@media screen and (max-width: 768px) {
  /* 移动端优先布局调整 */
  .container {
    width: 100%;
    padding: 20px 15px;
    gap: 30px;
  }

  .top-row {
    flex-direction: column;
    min-height: auto;
  }

  .map-block, .stats-block, .emotion-block, .frequency-block {
    width: 100%;
    min-height: 400px;
    max-height: 500px;
    padding: 15px;
  }

  .map-block {
    margin-bottom: 15px;
  }

  .section-title {
    font-size: 1.4rem;
    margin: 30px 0 15px;
  }

  /* 移动端导航栏优化 */
  .nav-links {
    display: none; /* 默认隐藏完整导航 */
  }

  /* 添加汉堡菜单 */
  .hamburger-menu {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    width: 30px;
    height: 21px;
    cursor: pointer;
  }

  .hamburger-menu .bar {
    height: 3px;
    background: #0a3d62;
    border-radius: 10px;
  }

  /* 移动菜单样式 */
  .mobile-menu {
    position: fixed;
    top: 60px;
    left: 0;
    width: 100%;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    z-index: 999;
    transform: translateY(-100%);
    transition: transform 0.3s ease;
  }

  .mobile-menu.active {
    transform: translateY(0);
  }

  .mobile-menu ul {
    list-style: none;
    padding: 0;
  }

  .mobile-menu li {
    border-bottom: 1px solid rgba(10, 61, 98, 0.1);
  }

  .mobile-menu a {
    display: block;
    padding: 15px 20px;
    color: #0a3d62;
    text-decoration: none;
  }
}

@media screen and (max-width: 480px) {
  /* 超小屏幕优化 */
  .section-title {
    font-size: 1.2rem;
  }

  .description-text {
    font-size: 0.9rem;
    padding: 15px 10px;
    line-height: 1.6;
  }

  .map-block, .emotion-block, .frequency-block {
    min-height: 350px;
    padding: 10px;
  }
}
</style>
