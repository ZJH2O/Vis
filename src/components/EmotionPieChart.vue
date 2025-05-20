<template>
  <div class="chart-container">
    <h1 class="chart-title">情感分析</h1>
    <v-chart class="chart" :option="chartOptions" autoresize />
  </div>
</template>

<script setup lang="js">
import { ref, onMounted } from 'vue'
import { use } from 'echarts/core'
import VChart from 'vue-echarts'
import { CanvasRenderer } from 'echarts/renderers'
import { ScatterChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'

// 注册 ECharts 所需组件
use([
  CanvasRenderer,
  ScatterChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

// 导入JSON数据文件
import rawData from '@/assets/enhanced_stats_v3.json'

// 定义情感类型数据，包括名称、初始值和显示颜色
const emotions = [
  { name: 'Positive', value: 0, color: '#e7e176' },  // 积极情感，黄色表示
  { name: 'Negative', value: 0, color: '#e87a7a' },  // 消极情感，红色表示
  { name: 'Neutral', value: 0, color: '#b5b5b5' },   // 中性情感，灰色表示
  { name: 'Emergency', value: 0, color: '#f2a1d1' }  // 紧急情感，粉色表示
]

// 处理原始数据，计算每种情感的总点赞数并生成散点图数据
const processData = () => {
  // 创建结果数组，存储所有生成的数据点
  const result = []

  // 遍历每种情感类型
  emotions.forEach((emotion, emotionIndex) => {
    // 获取当前情感类型的所有时间块数据
    const timeBlocks = rawData.emotion_timelines[emotion.name]

    // 如果该情感类型没有数据，则跳过处理
    if (!timeBlocks || !timeBlocks.length) return

    // 计算该情感类型的总点赞数（所有时间块的点赞数总和）
    // 即使在显示时过滤掉低于500的，在计算总和时仍然包含所有点赞数
    let totalLikes = 0
    timeBlocks.forEach(block => {
      totalLikes += block.total_likes || 0
    })

    // 更新情感类型的总点赞数值
    emotion.value = totalLikes

    // 过滤出点赞数大于等于500的时间块
    const filteredTimeBlocks = timeBlocks.filter(block => (block.total_likes || 0) >= 500)

    // 如果过滤后没有数据，则跳过该情感类型
    if (filteredTimeBlocks.length === 0) return

    // 计算x轴的基准位置和步长，确保不同时间块在x轴上均匀分布
    const baseX = 200  // 不同情感类型的基准x位置
    const step = 800 / (filteredTimeBlocks.length + 1)  // 同一情感类型内，不同时间块之间的x轴距离

    // 为每个满足条件的时间块创建一个数据点
    filteredTimeBlocks.forEach((block, blockIndex) => {
      // 计算气泡大小，使用较小的气泡尺寸
      const size = Math.sqrt(block.total_likes) * 0.3 + 1

      // 计算x坐标，使同一情感的不同时间块均匀分布
      const x = baseX + (blockIndex + 1) * step

      // 添加数据点到结果数组
      result.push({
        name: emotion.name,  // 情感类型名称
        value: [x, 3 - emotionIndex, size],  // [x坐标, y坐标, 气泡大小]
        itemStyle: {
          color: emotion.color,  // 设置颜色，与情感类型对应
          opacity: 0.7  // 设置透明度，使重叠的点可见
        },
        // 添加额外数据用于悬停提示框显示
        timeBlock: block.time_block,  // 时间块标识
        totalLikes: block.total_likes,  // 该时间块的总点赞数
        totalTweets: block.total_tweets,  // 该时间块的总推文数
        hotTweets: block.hot?.tweet_samples || []  // 热门推文样本，可能不存在
      })
    })
  })

  return result
}

// 图表配置选项
const chartOptions = ref({
  tooltip: {
    // 自定义提示框内容，显示时间块详细信息
    formatter: function(params) {
      return `<div style="font-weight:bold">时间段: ${params.data.timeBlock}</div>` +
             `情感类型: ${params.data.name}<br/>` +
             `总点赞数: ${params.data.totalLikes}<br/>` +
             `总推文数: ${params.data.totalTweets}`
    }
  },
  grid: {
    left: 180,  // 左侧留出足够空间显示y轴标签
    right: 20,
    top: 20,
    bottom: 20
  },
  xAxis: {
    type: 'value',
    min: 0,
    max: 1200,
    // 隐藏x轴相关元素，使图表更简洁
    splitLine: { show: false },
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false }
  },
  yAxis: {
    type: 'category',
    data: emotions.map(e => e.name),  // y轴显示各情感类型名称
    axisLabel: {
      // 自定义y轴标签，显示情感类型和总点赞数
      formatter: function(value, index) {
        return `{${value}|${value}\n${emotions[index].value}}`
      },
      // 为每种情感类型定义富文本样式
      rich: {
        Positive: {
          color: '#e7e176',
          fontSize: 14,
          fontWeight: 'bold',
          padding: [10, 0, 0, 0],
          align: 'center'
        },
        Negative: {
          color: '#e87a7a',
          fontSize: 14,
          fontWeight: 'bold',
          padding: [10, 0, 0, 0],
          align: 'center'
        },
        Neutral: {
          color: '#b5b5b5',
          fontSize: 14,
          fontWeight: 'bold',
          padding: [10, 0, 0, 0],
          align: 'center'
        },
        Emergency: {
          color: '#f2a1d1',
          fontSize: 14,
          fontWeight: 'bold',
          padding: [10, 0, 0, 0],
          align: 'center'
        }
      },
      width: 150,
      // 设置y轴标签的背景颜色，对应情感类型的颜色
      backgroundColor: function(params) {
        return emotions[params.dataIndex].color;
      },
      borderRadius: 4,
      padding: [10, 0, 10, 0],
      fontSize: 14,
      fontWeight: 'bold',
      color: 'white',
      align: 'center'
    },
    // 隐藏y轴线和刻度，使图表更简洁
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { show: false }
  },
  series: [
    {
      type: 'scatter',  // 使用散点图类型
      // 设置散点大小，使用value数组中的第三个值（对应点赞数）
      symbolSize: function (data) {
        return data[2];
      },
      data: []  // 数据将在组件挂载后通过processData填充
    }
  ]
})

// 在组件挂载后处理数据并更新图表
onMounted(() => {
  // 处理JSON数据并更新图表数据
  chartOptions.value.series[0].data = processData();
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.chart-title {
  color: #555;
  font-size: 24px;
  margin-bottom: 10px;
  font-weight: normal;
}

.chart {
  width: 150%;
  height: 600px;
}
</style>
