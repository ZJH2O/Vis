<!-- WordCloud.vue -->
<template>
  <div ref="chartEl" class="chart"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts/core'
import 'echarts-wordcloud'
import { BarChart} from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  PolarComponent,
  SingleAxisComponent,
} from 'echarts/components'
import { LabelLayout } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import Data from '../assets/word_frequency_analysis_pro.json'
// 注册必需组件
echarts.use([
  BarChart,
  TitleComponent,
  TooltipComponent,
  PolarComponent,
  SingleAxisComponent,
  CanvasRenderer,
  LabelLayout,
])

// 组合Option类型
// 数据接口
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

// 组件逻辑
const chartEl = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null
const currentWord = ref<string | null>(null)
const currentBlock = ref<string | null>(null)
// 颜色生成函数
const getColor = (value: number, max: number): string => {
  const ratio = value / max
  return echarts.color.modifyHSL(
    '#5470c6',
    ratio,       // 色相偏移量保持渐变效果
    0.6,             // 固定饱和度保证颜色纯度
    0.8 - 0.3 * ratio // 亮度反转：高值→低亮度，低值→高亮度
  )
}

// 生成环形图数据
const getPolarData = () => {
  const getValue = (b: TimeBlock) =>
    currentWord.value
      ? b.word_frequency.find(w => w.word === currentWord.value)?.count || 0
      : b.total_words

  const max = Math.max(...data.time_blocks.map(getValue))

  return data.time_blocks.map(b => ({
    value: getValue(b),
    word: currentWord.value || '',
    topWords: b.top_words.slice(0, 3).map(w => w.word).join(', '),
    itemStyle: {
      color: getColor(getValue(b), max),
      opacity: currentWord.value ? 0.8 : 1
    },
    name: `${b.block_start} - ${b.block_end}`
  }))
}
// 生成词云数据
const getWordData = (): WordItem[] => {
  if (currentBlock.value) {
    return data.time_blocks.find(b =>
      `${b.block_start} - ${b.block_end}` === currentBlock.value
    )?.top_words || []
  }
  return data.total_word_freq
}

// 图表配置
const getOption = ():echarts.EChartsCoreOption => ({
  title: {
    text: '地震舆情词云分析',
    subtext: `数据时段: ${data.time_blocks[0].block_start} ~ ${data.time_blocks.slice(-1)[0].block_end}`,
    left: 'center',
    padding:[10,0,0,0],
    textStyle: {
      color: '#2c3e50',
      fontSize: 20,
      fontFamily: 'Microsoft YaHei',
      fontWeight: 600
    },
    subtextStyle: {
      color: '#7f8c8d',
      fontSize: 14,
      padding:[60,0,0,0],
    }
  },
  tooltip: {
    trigger: 'item',
    formatter: (params: any) => {
      if (params.seriesType === 'wordCloud') {
        return `${params.name}<br/>词频: ${params.value}`
      }
      if (params.seriesType === 'bar') {
        const data = params.data
        // 根据是否选中词语显示不同内容
        return data.word
          ? `词语: ${data.word}<br/>时段: ${params.name}<br/>词频: ${data.value}`
          : `时段: ${params.name}<br/>总词频: ${data.value}<br/>高频词: ${data.topWords}`
      }
      return ''
    }
  },
  polar: {
    z:0,
    center: ['50%', '55%'],
    radius: ['66%', '88%'],
    backgroundColor: {
      type: 'angular',
      colorStops: [
        { offset: 0, color: 'hsl(15, 100%, 50%)' },   // 0°: 深红色
        { offset: 0.3, color: 'hsl(30, 100%, 50%)' }, // 108°: 橙红
        { offset: 0.7, color: 'hsl(45, 100%, 60%)' }, // 252°: 橙色
        { offset: 1, color: 'hsl(60, 100%, 70%)' }    // 360°: 浅黄
      ],
      globalCoord: false // 保持局部坐标系
    }
  },
  angleAxis: {
    type: 'category',
    data: data.time_blocks.map(b => `${b.block_start} - ${b.block_end}`),
    axisLabel: {
      color: 'transparent', // 完全隐藏标签
    },
    axisPointer: {  // 悬停时显示完整标签
      show: true,
      type: 'shadow',
      label: {
        show: true,
        backgroundColor: 'rgba(255, 255, 255, 0.6)', // 半透明白色背景
        color: '#2c3e50', // 深色文字
      },
      shadowStyle: {
          color: 'rgba(255, 176, 82, 0.3)', // 浅蓝色半透明阴影
      }
    },
    axisLine: {
      lineStyle: {
        color: {
          type: 'angular', // 角度渐变模式
          colorStops: [
            { offset: 0, color: 'hsl(60, 100%, 70%)' },   // 红色
            // { offset: 0.3, color: 'hsl(45, 100%, 60%)' }, // 橙红
            { offset: 1, color: 'hsl(30, 100%, 50%)' }, // 橙色
            { offset: 0.7, color: 'hsl(15, 100%, 50%)' }    // 浅黄
          ],
          global: false // 使用局部坐标系
        },
        width: 3,        // 轴线宽度
        shadowColor: 'rgba(0,0,0,0.1)', // 可选阴影
        shadowBlur: 6
      }

    },

  },
  radiusAxis: { show: false,

   },
  series: [
    {
      type: 'wordCloud',
      shape: 'circle',
      left: 'center',
      top: '20%',
      width: '70%',
      height: '70%',
      sizeRange: [14, 64],
      rotationRange: [0, 0],
      gridSize: 8,
      textStyle: {
        opacity: 0.95,
        textBorderColor: 'rgba(255,255,255,0.8)',
        textBorderWidth: 1.5,
        fontFamily: 'Helvetica Neue',
        fontWeight: 500,
        textShadowColor: 'rgba(0,0,0,0.15)',
        textShadowBlur: 4,
        transition: 'all 0.3s'
      },
      emphasis: {
        textStyle: {
          color: '#2c3e50',
        }
      },
      data: getWordData().map(d => ({
        name: d.word,
        value: d.count,
        textStyle: {
          color: getColor(d.count, data.total_word_freq[0].count),
          emphasis: {
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.3)'
          },
        }
      })),
      animationDuration: 1000
    },
    {
      type: 'bar',
      coordinateSystem: 'polar',
      data: getPolarData(),
      itemStyle: {
        borderRadius: 5,
        shadowBlur: 10,
        shadowColor: 'rgba(0,0,0,0.3)'
      },
      emphasis: {
        focus: 'self',
        itemStyle: {
          shadowBlur: 20,
          shadowColor: 'rgba(0,0,0,0.5)'
        }
      },

      barWidth: '20%',
      animationDelay: (idx: number) => idx * 10
    },
  ]
})

// 初始化图表
onMounted( () => {

  chart = echarts.init(chartEl.value)
  chart.setOption(getOption())
  // 统一事件处理
  const handleChartClick = (params: any) => {
    if (params.seriesType === 'wordCloud') {
      currentWord.value = params.name ?
        (currentWord.value === params.name ? null : params.name) : null
      currentBlock.value = null
    } else if (params.seriesType === 'bar') {
      currentBlock.value = params.name ?
        (currentBlock.value === params.name ? null : params.name) : null
      currentWord.value = null
    }


    chart?.setOption(getOption())
  }

  chart.on('click', handleChartClick)

  // 响应式调整
  const resizeHandler = () => chart?.resize()
  window.addEventListener('resize', resizeHandler)

  onUnmounted(() => {
    window.removeEventListener('resize', resizeHandler)
    chart?.dispose()
  })
})
</script>

<style scoped>
.chart {
  width: 500x;
  height: 600px;
}

</style>
