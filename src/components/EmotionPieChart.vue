<template>
  <div class="chart-container">
    <h1 class="chart-title">情感分析</h1>
    <v-chart class="chart" :option="chartOptions" autoresize @click="handleChartClick" />

    <!-- Tweet details modal -->
    <div v-if="selectedTweet" class="tweet-modal">
      <div class="tweet-modal-content">
        <span class="close-button" @click="selectedTweet = null">&times;</span>
        <h3>Tweet Details</h3>
        <div class="tweet-details">
          <p><strong>ID:</strong> {{ selectedTweet.id }}</p>
          <p><strong>Text:</strong> {{ selectedTweet.text }}</p>
          <p><strong>Likes:</strong> {{ selectedTweet.likes }}</p>
          <p><strong>Retweets:</strong> {{ selectedTweet.retweets }}</p>
          <p><strong>Timestamp:</strong> {{ selectedTweet.timestamp }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
import { ref, onMounted, computed, watch } from 'vue'
import { use } from 'echarts/core'
import VChart from 'vue-echarts'
import { CanvasRenderer } from 'echarts/renderers'
import { ScatterChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  ToolboxComponent
} from 'echarts/components'

// 注册 ECharts 所需组件
use([
  CanvasRenderer,
  ScatterChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  ToolboxComponent
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

// 状态变量
const selectedPoint = ref(null)      // 当前选中的散点
const selectedTweet = ref(null)      // 当前选中的推文
const chartOptions = ref({})         // 图表配置选项

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
        hotTweets: block.hot?.tweet_samples || [],  // 热门推文样本，可能不存在
        othersTweets: block.others?.tweet_samples || [],  // 其他推文样本，可能不存在
        emotion: emotion.name,  // 情感类型
        emotionColor: emotion.color,  // 情感类型颜色
        rawBlock: block  // 存储完整的时间块数据以供后续使用
      })
    })
  })

  return result
}

// 生成嵌套环图数据
const generateNestedPieData = (point) => {
  if (!point) return { inner: [], outer: [] }

  const block = point.rawBlock
  const hotCount = block.hot?.total_tweets || 0
  const othersCount = block.others?.total_tweets || 0

  // 内环数据：hot vs others
  const innerData = []
  if (hotCount > 0) {
    innerData.push({
      name: 'hot',
      value: hotCount,
      itemStyle: { color: '#ff9a76' }
    })
  }
  if (othersCount > 0) {
    innerData.push({
      name: 'other',
      value: othersCount,
      itemStyle: { color: '#a3d2ca' }
    })
  }

  // 外环数据：各个推文样本，按retweets比例划分
  const outerData = []

  // 合并热门和其他推文样本
  const allTweets = [
    ...(block.hot?.tweet_samples || []).map(t => ({ ...t, category: 'Hot' })),
    ...(block.others?.tweet_samples || []).map(t => ({ ...t, category: 'Others' }))
  ]

  // 按retweets数量为每个推文分配比例
  allTweets.forEach(tweet => {
    outerData.push({
      name: tweet.text.length > 20 ? tweet.text.substring(0, 20) + '...' : tweet.text,
      value: tweet.retweets || 1,  // 确保至少有1的值，避免完全不显示
      itemStyle: {
        color: tweet.category === 'Hot' ? '#ffb15e' : '#83c5be'  // 基于类别设置颜色
      },
      // 存储完整推文信息
      tweetInfo: {
        id: tweet.id,
        text: tweet.text,
        likes: tweet.likes,
        retweets: tweet.retweets,
        timestamp: tweet.timestamp,
        category: tweet.category
      }
    })
  })

  return { inner: innerData, outer: outerData }
}

// 处理图表点击事件
const handleChartClick = (params) => {
  // 如果点击的是散点图的点
  if (params.seriesType === 'scatter') {
    selectedPoint.value = params.data
    updateChartOptions()
  }
  // 如果点击的是环图的扇区
  else if (params.seriesType === 'pie' && params.seriesIndex === 1) {
    // 点击外环，显示推文详情
    selectedTweet.value = params.data.tweetInfo
  }
}

// 更新图表配置
const updateChartOptions = () => {
  const scatterData = processData()
  const pieData = generateNestedPieData(selectedPoint.value)

  // 配置图表选项
  chartOptions.value = {
    tooltip: {
      formatter: function(params) {
        if (params.seriesType === 'scatter') {
          return `<div style="font-weight:bold">时间段: ${params.data.timeBlock}</div>` +
                 `情感类型: ${params.data.name}<br/>` +
                 `总点赞数: ${params.data.totalLikes}<br/>` +
                 `总推文数: ${params.data.totalTweets}<br/>` +
                 `<i>点击查看详细内容</i>`
        } else if (params.seriesType === 'pie') {
          if (params.seriesIndex === 0) {
            return `<b>${params.data.name}</b><br/>` +
                   `数量: ${params.data.value}<br/>` +
                   `占比: ${params.percent}%`
          } else {
            return `<b>推文</b><br/>` +
                   `${params.data.tweetInfo.text}<br/>` +
                   `点赞数: ${params.data.tweetInfo.likes}<br/>` +
                   `转发数: ${params.data.tweetInfo.retweets}<br/>` +
                   `<i>点击查看完整信息</i>`
          }
        }
      }
    },
    grid: {
      left: 180,
      right: selectedPoint.value ? 450 : 20,  // 如果选中了点，则右侧留出空间显示环图
      top: 20,
      bottom: 20
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: 1200,
      splitLine: { show: false },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false }
    },
    yAxis: {
      type: 'category',
      data: emotions.map(e => e.name),
      axisLabel: {
        formatter: function(value, index) {
          return `{${value}|${value}\n${emotions[index].value}}`
        },
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
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: false }
    },
    series: [
      {
        type: 'scatter',
        symbolSize: function (data) {
          return data[2];
        },
        data: scatterData
      }
    ]
  }

  // 如果有选中的点，添加嵌套环图
  if (selectedPoint.value) {
    // 添加标题，显示当前选中的时间块和情感类型
    chartOptions.value.title = {
      text: `时间段: ${selectedPoint.value.timeBlock} - ${selectedPoint.value.emotion}`,
      subtext: '点击扇区查看推文详情',
      right: 200,
      top: 40,
      textStyle: {
        fontSize: 16,
        color: selectedPoint.value.emotionColor
      }
    }

    // 添加内环（热门 vs 其他）
    chartOptions.value.series.push({
      name: '分类',
      type: 'pie',
      center: ['80%', '50%'],
      radius: ['20%', '35%'],
      label: {
        position: 'inner',
        fontSize: 12
      },
      itemStyle: {
        borderWidth: 2,
        borderColor: '#fff'
      },
      data: pieData.inner
    })

    // 添加外环（推文样本）
    chartOptions.value.series.push({
      name: '推文',
      type: 'pie',
      center: ['80%', '50%'],
      radius: ['40%', '65%'],
      label: {
        fontSize: 10,
        formatter: '{b}',
        length: 15,
        length2: 10
      },
      labelLine: {
        length: 10,
        length2: 10,
        maxSurfaceAngle: 80
      },
      itemStyle: {
        borderWidth: 1,
        borderColor: '#fff'
      },
      data: pieData.outer
    })
  }
}

// 初始化
onMounted(() => {
  updateChartOptions()
})

// 监听选中点的变化，更新图表
watch(selectedPoint, () => {
  updateChartOptions()
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  padding: 20px;
  font-family: Arial, sans-serif;
  position: relative;
}

.chart-title {
  color: #555;
  font-size: 24px;
  margin-bottom: 10px;
  font-weight: normal;
}

.chart {
  width: 1500px;
  height: 600px;
}

/* 推文详情模态框样式 */
.tweet-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.tweet-modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 500px;
  max-width: 80%;
  position: relative;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 24px;
  cursor: pointer;
}

.tweet-details {
  margin-top: 15px;
}

.tweet-details p {
  margin: 8px 0;
}
</style>
