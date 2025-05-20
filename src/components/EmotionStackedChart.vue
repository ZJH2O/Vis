<template>
  <div class="container">
    <div class="charts">
      <div ref="barChart" class="chart chart-bar"></div>
      <div ref="pieChart" class="chart chart-pie"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import rawData from '../assets/emotion_stats_with_totals.json'

const barChart = ref(null)
const pieChart = ref(null)
let barInstance, pieInstance

// 柔和色调映射
const emotionColors = {
  Positive: '#6dd09a',
  Neutral: '#6aaedb',
  Emergency: '#e6996a',
  Negative: '#e88a82',
}

// 堆叠顺序（从下到上）
const orderedEmotions = ['Negative', 'Emergency', 'Neutral', 'Positive']
const isPositive = (e) => e === 'Positive' || e === 'Neutral'

const renderBarChart = () => {
  const timeBlocks = rawData.statistics.map(s => s.time_block)

  const series = orderedEmotions.map(emotion => ({
    name: emotion,
    type: 'bar',
    stack: 'total',
    itemStyle: { color: emotionColors[emotion] },
    data: rawData.statistics.map(s => {
      const count = s.emotions[emotion]?.total || 0
      return isPositive(emotion) ? count : -count
    })
  }))

  const option = {
    title: {
      text: '情绪堆叠图（绿色为积极，顶部堆叠）',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: params => {
        const time = params[0].axisValue
        const lines = [`<b>${time}</b>`]
        params.forEach(p => {
          const val = Math.abs(p.value)
          lines.push(`${p.marker} ${p.seriesName}: ${val}`)
        })
        return lines.join('<br/>')
      }
    },
    legend: {
      top: 40,
      data: orderedEmotions
    },
    grid: {
      left: '12%',
      right: '5%',
      top: '20%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: timeBlocks,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { show: false }
    },
    yAxis: {
      type: 'value',
      min: -258,
      max: 292,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: true }
    },
    series
  }

  barInstance = echarts.init(barChart.value)
  barInstance.setOption(option)

  barInstance.on('click', (params) => {
    const idx = params.dataIndex
    renderSunburstChart(rawData.statistics[idx])
  })

  renderSunburstChart(rawData.statistics[0])
}

const renderSunburstChart = (stat) => {
  const sunburstData = []
  const emotionOrder = ['Positive', 'Neutral', 'Emergency', 'Negative']

  emotionOrder.forEach(emotion => {
    const details = stat.emotions[emotion]
    if (!details) return
    const total = details.total || 0
    const children = []

    for (const [sub, value] of Object.entries(details)) {
      if (sub === 'total') continue
      const percent = ((value / total) * 100).toFixed(1)
      children.push({
        name: `${sub} (${percent}%)`,
        value,
        itemStyle: { color: emotionColors[emotion] }
      })
    }

    sunburstData.push({
      name: emotion,
      children,
      itemStyle: { color: emotionColors[emotion] }
    })
  })

  const option = {
    title: {
      text: `情绪构成 - ${stat.time_block}`,
      left: 'center',
      top: 10,
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}'
    },
    series: [
      {
        type: 'sunburst',
        radius: [0, '90%'],
        center: ['50%', '55%'],
        sort: null,
        // 不设置 nodeClick 禁用整图点击
        data: sunburstData,
        label: {
          rotate: 'radial',
          fontSize: 12
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1
        },
        levels: [
          {
            r0: 0,
            r: 30,
            label: {
              position: 'center',
              fontSize: 16,
              color: '#666',
              formatter: () => 'ESC'
            },
            itemStyle: {
              color: '#f0f0f0'
            },
            nodeClick: false // 仅中心圆不可点击
          },
          {}, {}, {}, {}
        ]
      }
    ]
  }

  if (!pieInstance) {
    pieInstance = echarts.init(pieChart.value)
  }
  pieInstance.setOption(option)
}

const handleResize = () => {
  barInstance?.resize()
  pieInstance?.resize()
}

onMounted(() => {
  renderBarChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
}
.charts {
  display: flex;
  width: 1280px;
  height: 500px;
}
.chart {
  height: 100%;
}
.chart-bar {
  width: 65%;
}
.chart-pie {
  width: 35%;
}
</style>
