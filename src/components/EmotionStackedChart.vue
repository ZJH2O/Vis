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

const emotionColors = {
  Positive: '#2ecc71',
  Neutral: '#3498db',
  Emergency: '#e67e22',
  Negative: '#e74c3c',
}

const renderBarChart = () => {
  const timeBlocks = rawData.statistics.map(s => s.time_block)
  const emotions = ['Positive', 'Neutral', 'Emergency', 'Negative']
  const isPositive = (e) => e === 'Positive' || e === 'Neutral'

  const series = emotions.map(emotion => ({
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
      text: '情绪堆叠图（正：积极/中立，负：紧急/消极）',
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
      data: emotions
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
      axisLabel: { show: false }  // ✅ 不显示时间标签
    },
    yAxis: {
      type: 'value',
      min: -258,                   // ✅ 指定最小值
      max: 292,                    // ✅ 指定最大值
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
  const sunburstData = Object.entries(stat.emotions).map(([emotion, details]) => {
    const emotionColor = emotionColors[emotion] || '#ccc'
    const children = Object.entries(details)
      .filter(([key]) => key !== 'total')
      .map(([sub, value]) => ({
        name: sub,
        value,
        itemStyle: { color: emotionColor }
      }))
    return {
      name: emotion,
      children,
      itemStyle: { color: emotionColor }
    }
  })

  const option = {
    title: {
      text: `情绪构成（旭日图） - ${stat.time_block}`,
      left: 'center',
      top: 10,
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [
      {
        type: 'sunburst',
        radius: [0, '90%'],
        center: ['50%', '55%'],
        sort: null,
        data: sunburstData,
        label: {
          rotate: 'radial'
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1
        }
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
  height: 100vh;
  box-sizing: border-box;
  padding: 10px;
}
.charts {
  display: flex;
  width: 100%;
  height: 100%;
}
.chart {
  height: 100%;
}
.chart-bar {
  width: 50%;
}
.chart-pie {
  width: 50%;
}
</style>
