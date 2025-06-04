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
      <div class="map-section world-section"  ref="worldMap" id="world-map">
        <h2 class="section-title">全球地震分布</h2>
        <div class="top-row">
          <div class="map-block">
            <WorldMap />
          </div>
        </div>
        <div class="explanation-block">
          <p style="color: black;  padding: 15px; border-radius: 8px;">
           本视图主要展示全球范围内震级大于 7 级的地震分布情况。通过地图上的散点，能直观地看到这些强震在世界各地的具体位置。
           外圈散点的大小代表震级的高低，震级越大，散点越大，便于快速识别地震的强度。内圈则表示地震的深度，深度信息有助于了解地震的地质特征。
           颜色深浅和大小的变化可以让用户更清晰地判断地震的强度和深度差异。用户还可以通过缩放和平移地图，查看不同区域的地震详细信息。
           通过对全球地震分布的展示，有助于研究人员和相关机构分析地震的高发区域和活动规律，为地震预警和防灾减灾提供重要依据。
           对于公众来说，也能增加对地震的认识和了解，提高对地震灾害的防范意识。
           此外，地图上的时间维度信息可以帮助用户了解不同时间段内地震的发生频率和变化趋势。
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
          <p style="color: black;  padding: 15px; border-radius: 8px;">
            此视图聚焦于中国地区的地震监测情况。地图以省份为单位，展示了各省的地震发生次数分布。颜色越深的省份，表示地震发生的次数越多。
            右侧的统计图表呈现了特定省份的地震次数和平均震级的变化情况。用户可以通过点击地图上的省份，查看该省份的详细统计信息。
            这种展示方式有助于深入了解中国不同地区的地震活动特征，为地震研究和灾害防范提供数据支持。
            对于相关部门来说，可以根据这些信息合理规划地震防范措施，提高应对地震灾害的能力。
            同时，也能让公众了解自己所在地区的地震风险，增强自我防范意识。
            此外，通过对比不同年份和时间段的数据，还可以分析中国地震活动的长期变化趋势。
          </p>
        </div>
      </div>

      <!-- 新增情感分析区块 -->
      <div class="map-section sentiment-section" ref="sentiment" id="sentiment-analysis">
        <h2 class="section-title">舆论情感分析</h2>
        <div class="top-row">
          <div class="emotion-block">
            <EmotionStackedChart />
          </div>
        </div>
        <div class="explanation-block">
          <p style="color: black; padding: 15px; border-radius: 8px;">
            该视图主要用于分析与地震相关的舆论情感。通过堆叠图的形式，展示了不同时间段内积极、消极、中性等情感的构成比例。
            从堆叠图中可以直观地看到各种情感在不同时间段的变化趋势，有助于了解公众对地震事件的情感倾向和态度。
            对于相关部门来说，可以根据舆论情感的分析结果，及时调整信息发布策略，引导公众正确看待地震事件。
            同时，也能为地震应急管理提供参考，更好地满足公众的信息需求和心理安抚。
            此外，通过对不同地区舆论情感的分析，还可以了解地区间的差异，有针对性地开展工作。
            这种情感分析有助于促进社会的稳定和和谐，提高公众对地震灾害的应对能力。
          </p>
        </div>
      </div>

      <div class="map-section sentiment-section" ref="hotTopics" id="hot-analysis">
        <h2 class="section-title">相关热点分析</h2>
        <div class="top-row">
          <div class="emotion-block">
            <EmotionPieChart />
          </div>
        </div>
        <div class="explanation-block">
          <p style="color: black;  padding: 15px; border-radius: 8px;">
            本视图聚焦于地震相关的热点话题。使用饼图展示了不同情感热点的占比情况，清晰呈现了积极、消极、中性热点的分布比例。
            通过饼图可以快速把握当前地震相关的热点情感倾向，了解公众关注的重点话题。
            对于媒体和相关机构来说，可以根据热点分析结果，调整报道方向和内容，更好地满足公众的信息需求。
            同时，也有助于相关部门及时了解公众的关注点，制定相应的政策和措施。
            此外，通过对比不同时间段的热点分析结果，可以发现热点话题的变化趋势，为舆情监测和引导提供有力支持。
            这种热点分析有助于提高信息传播的针对性和有效性，促进社会的良性发展。
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
          <p style="color: black;padding: 15px; border-radius: 8px;">
           此视图进行地震相关文本的词频统计分析。词云图展示了高频词汇，字体大小表示词频高低，能够直观地反映出文本中的关键话题。
            柱状图呈现了特定时间段内的词频变化，帮助用户了解不同词汇在不同时间段的热度变化。
            通过词频统计分析，可以发现地震相关的关键话题和趋势，为深入研究地震舆情提供数据支持。
            对于研究人员来说，可以根据词频分析结果，挖掘公众对地震事件的关注点和需求。
            同时，也能为相关部门制定宣传和引导策略提供参考，提高信息传播的效果。
            此外，结合其他分析方法，还可以更全面地了解地震舆情的动态变化。
        </p>
        </div>
      </div>
      <div class="map-section sentiment-section" ref="sankey" id="sankey">
        <h2 class="section-title">桑基图分析</h2>
        <div class="top-row">
          <div class="map-block">
            <SankeyChart />
          </div>
        </div>
        <div class="explanation-block">
          <p style="color: black; padding: 15px; border-radius: 8px;">
            该视图使用桑基图展示地震相关数据的关联关系。节点表示不同类别，边表示它们之间的连接和流量，清晰呈现了数据的流向和比例关系。
            通过桑基图可以分析地震相关因素之间的相互影响，例如不同地区、不同震级、不同情感之间的关联。
            对于研究人员来说，桑基图有助于深入理解地震数据的内在结构和关系，为地震研究提供新的视角。
            同时，也能为地震决策提供可视化支持，帮助决策者更好地把握数据的全貌。
            此外，通过对比不同时间段的桑基图，可以发现地震相关关系的变化趋势，为地震预测和防范提供参考。
            这种可视化分析有助于提高地震研究和决策的科学性和准确性。
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
  { id: 'sankey', title: '桑基图分析' },
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
  height: auto;
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
</style>
