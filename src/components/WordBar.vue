// WordBarChart.vue
<template>
  <div class="chart-container">
    <div ref="chartDom" class="chart"></div>
    <div v-if="!isPlaying" class="play-control">
      <button @click="togglePlay">▶️ 继续播放</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart } from 'echarts/charts'
import {
  TitleComponent,
  GridComponent,
  TooltipComponent,
  DatasetComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import dayjs from 'dayjs'
import Data from '../assets/word_frequency_analysis_pro.json'

// 按需注册模块
echarts.use([
  BarChart,
  TitleComponent,
  GridComponent,
  TooltipComponent,
  DatasetComponent,
  CanvasRenderer
])

interface WordItem {
  word: string
  count: number
}

interface TimeBlock {
  block_start: string
  block_end: string
  total_words: number
  top_words: WordItem[]
  word_frequency: WordItem[]
}

interface chartData {
  metadata: {
    time_interval: string
    total_tweets: number
    unique_words: number
    stopwords_removed: number
    processed_at: string
  }
  time_blocks: TimeBlock[]
  total_word_freq: WordItem[]
}

const data: chartData = Data as chartData

// 颜色配置
const colorPalette = [
  '#F8C6E6', // Positive
  '#E3B4B4', // Neutral
  '#F5E6B3', // Emergency
  '#B5B5B5'  // Negative
]

const getHSLColor = (count: number, maxCount: number) => {
  // 计算比例（0-1之间）
  const ratio = count / maxCount;

  // 反转颜色映射：高词频显示红色，低词频显示黄色
  if (ratio <= 0.3) {
    // 在0-0.3区间：浅黄(60°)到橙色(45°)
    const t = ratio / 0.3;
    const h = 60 - t * 15; // 60° → 45°
    const l = 70 - t * 15; // 70% → 55%
    return `hsl(${h}, 100%, ${l}%)`;
  } else if (ratio <= 0.7) {
    // 在0.3-0.7区间：橙色(45°)到橙红(30°)
    const t = (ratio - 0.3) / 0.4;
    const h = 45 - t * 15; // 45° → 30°
    return `hsl(${h}, 100%, 55%)`;
  } else {
    // 在0.7-1.0区间：橙红(30°)到深红(15°)
    const t = (ratio - 0.7) / 0.3;
    const h = 30 - t * 15; // 30° → 15°
    return `hsl(${h}, 100%, 50%)`;
  }
};

// 响应式变量
const chartDom = ref<HTMLElement>()
const chartInstance = ref<echarts.ECharts>()
const isPlaying = ref(true)
const currentIndex = ref(0)
// 时间格式化
const formatTime = (str: string) => {
  return dayjs(str).format('MM/DD HH:mm')
}
// 预处理时间序列数据
const timeSeries = data.time_blocks.map(block => ({
  time: `${formatTime(block.block_start)} ~ ${formatTime(block.block_end)}`,
  words: block.word_frequency
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)
}))


// 初始化图表
const initChart = () => {
  if (!chartDom.value) return

  chartInstance.value = echarts.init(chartDom.value)

  const option: echarts.EChartsCoreOption = {
    title: {
      text: 'TOP20高频词动态排序',
      left: 'center',
      textStyle: {
        color: '#666',
        fontSize: 18
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const dataItem = params[0].data
        return `
          <strong>${dataItem.name}</strong><br/>
          出现次数: ${dataItem.value}次<br/>
          时间段: ${dataItem.time}
        `
      }
    },
    xAxis: {
      type: 'value',
      max: 'dataMax',
      axisLabel: {
        color: '#666',
        formatter: (value: number) => `${value}次`
      },
      splitLine: {
        lineStyle: {
          color: '#eee'
        }
      }
    },
    yAxis: {
      type: 'category',
      inverse: true,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        width: 120,
        overflow: 'truncate',
        color: '#444',
        fontSize: 12,
      },
      animationDuration: 400,
      animationDurationUpdate: 400
    },
    grid: {
      left: '12%',
      right: '8%',
      top: '15%',
      bottom: '10%'
    },
    series: [{
      universalTransition: { // 开启元素复用过渡
        enabled: true,
        divideShape: 'clone' ,// 元素分裂方式
        delay: (idx:number) => idx * 40, // 分阶段过渡
        split: (count:number) => ({ count }) // 自动分配动画资源
      },
      realtimeSort: true,
      type: 'bar',
      barWidth: '60%',
      itemStyle: {
        color: (params) => colorPalette[params.dataIndex % 4]
      },
      label: {
        show: true,
        position: 'right',
        color: '#666',
        valueAnimation: true,
        formatter: '{c}次'
      },
      data: []
    }],
    animationDelay: (idx) => idx * 35, // 元素错峰动画
    animationDurationUpdate: 2000, // 更新动画时长
    animationEasing: 'exponentialOut', // 优化进出动画曲线
  }

  chartInstance.value.setOption(option)
}

// 更新数据
const updateData = () => {
  if (!chartInstance.value || !isPlaying.value) return

  const currentData = timeSeries[currentIndex.value]
  const words = currentData.words
  const maxCount = Math.max(...words.map(w => w.count))

  chartInstance.value.setOption({
    title: {
      text: `时间段：${currentData.time}`
    },
    yAxis: {
      data: words.map(w => w.word) // 添加 y 轴类别数据
    },
    series: [{
      data: currentData.words.map(w => ({
        value: w.count,
        name: w.word,
        time: currentData.time,
        itemStyle: {
          color: getHSLColor(w.count, maxCount) // 动态计算HSL颜色
        }
      }))
    }]
  })

  currentIndex.value = (currentIndex.value + 1) % timeSeries.length
}

// 播放控制
let timer: number | undefined = null
const togglePlay = () => {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    timer = setInterval(updateData, 4000)
  } else {
    clearInterval(timer)
  }
}
let lastRender = 0;
const animationLoop = () => {
    if (!isPlaying.value) return;

    const now = Date.now();
    const delta = now - lastRender;

    // 动态补偿时间偏移
    if (delta >= 4000) {
        updateData();
        lastRender = now - (delta % 4000);
    }
    requestAnimationFrame(animationLoop);
}

onMounted(() => {
  initChart()
  timer = requestAnimationFrame(animationLoop);
})

onBeforeUnmount(() => {
  clearInterval(timer)
  chartInstance.value?.dispose()
})
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 600px;
}

.chart {
  width: 100%;
  height: 100%;
}

.play-control {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}

button {
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

button:hover {
  background: #f5f5f5;
}

@media (max-width: 768px) {
  .chart-container {
    height: 400px;
  }

  :deep(.yAxis text) {
    font-size: 12px !important;
  }
}
</style>
