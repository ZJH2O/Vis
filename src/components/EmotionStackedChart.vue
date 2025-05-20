<template>
  <v-chart class="chart" :option="chartOptions" autoresize />
</template>

<script setup lang="js">
import { ref } from 'vue'
import { use } from 'echarts/core'
import VChart from 'vue-echarts'
import {
  CanvasRenderer
} from 'echarts/renderers'
import {
  LineChart
} from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'

// 注册 ECharts 所需组件
use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

// 导入数据（文件路径根据你的项目结构修改）
import rawData from '@/assets/emotion_stats_with_totals.json'

// 数据预处理
const timestamps = []
const positive = []
const neutral = []
const negative = []
const emergency = []

rawData.statistics.forEach(item => {
  const time = item.time_block.split(' ')[0] + ' ' + item.time_block.split(' ')[1]
  timestamps.push(time)

  positive.push(item.emotions?.Positive?.total || 0)
  neutral.push(item.emotions?.Neutral?.total || 0)
  negative.push(item.emotions?.Negative?.total || 0)
  emergency.push(item.emotions?.Emergency?.total || 0)
})

// 构建 ECharts 配置项
const chartOptions = ref({
  title: {
    text: '情绪堆叠图（积极 & 中立 ↑，紧急 & 消极 ↓）',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    formatter: function (params) {
      let tooltip = `${params[0].axisValue}<br/>`
      params.forEach(p => {
        tooltip += `${p.marker}${p.seriesName}: ${Math.abs(p.data)}<br/>`
      })
      return tooltip
    }
  },
  legend: {
    data: ['Positive', 'Neutral', 'Emergency', 'Negative'],
    top: 20,
    left: 'center'
  },
  grid: {
    left: 50,
    right: 60,
    top: 100,
    bottom: 60,
    containLabel: true
  },
 xAxis: {
  type: 'category',
  boundaryGap: false,
  data: timestamps,
  axisTick: {
    show: false
  },
  axisLabel: {
    inside: false,
    align: 'center',
    margin: 15,
    fontSize: 12,
    interval: 0,
    formatter: function (value, index) {
      const total = timestamps.length
      if (index === 0 || index === Math.floor(total / 2) || index === total - 1) {
        return value
      }
      return ''
    }
  }
},
yAxis: {
  type: 'value',
  axisTick: {
    show: false
  },
  min: value => -value.max,
  max: value => value.max,
  axisLabel: {
    formatter: val => Math.abs(val)
  }
},
  series: [
    {
      name: 'Neutral',
      type: 'line',
      stack: 'positive',
      symbol: 'none',
      lineStyle: { color: '#3498db' }, // 蓝色
      areaStyle: { color: '#3498db', opacity: 0.6 },
      data: neutral
    },
    {
      name: 'Positive',
      type: 'line',
      stack: 'positive',
      symbol: 'none',
      lineStyle: { color: '#2ecc71' }, // 绿色
      areaStyle: { color: '#2ecc71', opacity: 0.6 },
      data: positive
    },
    {
      name: 'Emergency',
      type: 'line',
      stack: 'negative',
      symbol: 'none',
      lineStyle: { color: '#e67e22' }, // 橙红
      areaStyle: { color: '#e67e22', opacity: 0.6 },
      data: emergency.map(v => -v)
    },
    {
      name: 'Negative',
      type: 'line',
      stack: 'negative',
      symbol: 'none',
      lineStyle: { color: '#e74c3c' }, // 红色
      areaStyle: { color: '#e74c3c', opacity: 0.6 },
      data: negative.map(v => -v)
    }
  ]
})
</script>

<style scoped>
.chart {
  width: 100%;
  height: 600px;
}
</style>
