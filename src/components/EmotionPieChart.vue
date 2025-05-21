<template>
  <div class="chart-container">
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

<script setup lang="ts">
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
import { EChartsOption, SeriesOption, PieSeriesOption, ScatterSeriesOption } from 'echarts'

// Register ECharts components
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

// Import JSON data file
import rawData from '@/assets/enhanced_stats_v3.json'

// Define interfaces for data structures
interface TweetInfo {
  id: string;
  text: string;
  likes: number;
  retweets: number;
  timestamp: string;
  category?: string;
}

interface TimeBlock {
  time_block: string;
  total_likes: number;
  total_tweets: number;
  hot?: {
    likes: number;
    retweets: number;
    tweet_samples: TweetInfo[];
  };
  other?: {
    likes: number;
    retweets: number;
    tweet_samples: TweetInfo[];
  };
}

interface EmotionData {
  name: string;
  value: number;
  color: string;
}

interface RawData {
  emotion_timelines: {
    [key: string]: TimeBlock[];
  };
}

interface ScatterDataPoint {
  name: string;
  value: [number, number, number]; // [x, y, size]
  itemStyle: {
    color: string;
    opacity: number;
  };
  timeBlock: string;
  totalLikes: number;
  totalTweets: number;
  hotTweets: TweetInfo[];
  othersTweets: TweetInfo[];
  emotion: string;
  emotionColor: string;
  rawBlock: TimeBlock;
}

interface PieDataItem {
  name: string;
  value: number;
  itemStyle: {
    color: string;
  };
  tweetInfo?: TweetInfo;
}

interface PieData {
  inner: PieDataItem[];
  outer: PieDataItem[];
}

interface ChartClickParams {
  seriesType: string;
  seriesIndex: number;
  data: any;
  percent?: number;
  dataIndex?: number;
  componentType?: string;
  value?: string;
}

// Define emotion types data, including name, initial value, and display color
// Rearranged in the requested order: Positive, Negative, Neutral, Emergency
const emotions: EmotionData[] = [
  { name: 'Emergency', value: 0, color: '#e7e176' },  // Emergency emotion, yellow
  { name: 'Negative', value: 0, color: '#e87a7a' },   // Negative emotion, red
  { name: 'Neutral', value: 0, color: '#b5b5b5' },    // Neutral emotion, grey
  { name: 'Positive', value: 0, color: '#f2a1d1' },   // Positive emotion, pink
]

// State variables
const selectedPoint = ref<ScatterDataPoint | null>(null) // Currently selected scatter point
const selectedTweet = ref<TweetInfo | null>(null)        // Currently selected tweet
const selectedEmotion = ref<string | null>(null)         // Currently selected Emotion
const chartOptions = ref<EChartsOption>({})              // Chart configuration options

// Process raw data, calculate total likes for each emotion type and generate scatter plot data
const processData = (): ScatterDataPoint[] => {
  // Create result array to store all generated data points
  const result: ScatterDataPoint[] = []

  // Iterate through each emotion type
  emotions.forEach((emotion, emotionIndex) => {
    // Get all time block data for the current emotion type
    const timeBlocks = (rawData as RawData).emotion_timelines[emotion.name]
    let opacity = 0.7  // Default opacity

    // If a specific emotion is selected, fade out others
    if (selectedEmotion.value && selectedEmotion.value !== emotion.name) {
      opacity = 0.05  // Reduce opacity for non-selected emotions
    }

    // Skip processing if there is no data for this emotion type
    if (!timeBlocks || !timeBlocks.length) return

    // Calculate total likes for this emotion type (sum of likes from all time blocks)
    let totalLikes = 0
    timeBlocks.forEach(block => {
      totalLikes += block.total_likes || 0
    })

    // Update the total likes value for this emotion type
    emotion.value = totalLikes

    // Filter time blocks with likes greater than or equal to 500
    const filteredTimeBlocks = timeBlocks.filter(block => (block.total_likes || 0) >= 500)

    // Skip this emotion type if there is no data after filtering
    if (filteredTimeBlocks.length === 0) return

    // Calculate base position on x-axis and step size to ensure even distribution
    const baseX = 200  // Base x position for different emotion types
    const step = 800 / (filteredTimeBlocks.length + 1)  // Distance between time blocks on x-axis

    // Create a data point for each qualifying time block
    filteredTimeBlocks.forEach((block, blockIndex) => {
      // Calculate bubble size, using a smaller bubble size
      const size = Math.sqrt(block.total_likes) * 0.3 + 1

      // Calculate x coordinate to evenly distribute time blocks of the same emotion
      const x = baseX + (blockIndex + 1) * step

      // If a specific point is selected, fade out others
      let pointOpacity = opacity
      if (selectedPoint.value &&
          !(selectedPoint.value.emotion === emotion.name &&
            selectedPoint.value.timeBlock === block.time_block)) {
        pointOpacity = 0.05  // Further reduce opacity for non-selected points
      }

      // Add data point to result array
      result.push({
        name: emotion.name,  // Emotion type name
        value: [x, emotionIndex, size],  // [x coordinate, y coordinate, bubble size]
        itemStyle: {
          color: emotion.color,  // Set color corresponding to emotion type
          opacity: pointOpacity  // Set transparency to make overlapping points visible
        },
        // Add additional data for hover tooltip display
        timeBlock: block.time_block,  // Time block identifier
        totalLikes: block.total_likes,  // Total likes for this time block
        totalTweets: block.total_tweets,  // Total tweets for this time block
        hotTweets: block.hot?.tweet_samples || [],  // Hot tweet samples, may not exist
        othersTweets: block.other?.tweet_samples || [],  // Other tweet samples, may not exist
        emotion: emotion.name,  // Emotion type
        emotionColor: emotion.color,  // Emotion type color
        rawBlock: block  // Store complete time block data for later use
      })
    })
  })

  return result
}

// Generate nested pie chart data
const generateNestedPieData = (point: ScatterDataPoint | null): PieData => {
  if (!point) return { inner: [], outer: [] }

  const block = point.rawBlock
  const hotCount = (block.hot?.likes || 0) + (block.hot?.retweets || 0)
  const othersCount = (block.other?.likes || 0) + (block.other?.retweets || 0)

  // Inner ring data: hot vs other
  const innerData: PieDataItem[] = []
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

  // Outer ring data: individual tweet samples, divided by retweets proportion
  const outerData: PieDataItem[] = []

  // Merge hot and other tweet samples
  const allTweets: (TweetInfo & { category: string })[] = [
    ...(block.hot?.tweet_samples || []).map(t => ({ ...t, category: 'hot' })),
    ...(block.other?.tweet_samples || []).map(t => ({ ...t, category: 'other' }))
  ]

  // Allocate proportion based on retweets count for each tweet
  allTweets.forEach(tweet => {
    outerData.push({
      name: tweet.text.length > 10 ? tweet.text.substring(0, 10) + '...' : tweet.text,
      value: tweet.retweets + tweet.likes || 1,  // Ensure at least a value of 1 to avoid not showing
      itemStyle: {
        color: tweet.category === 'hot' ? '#ffb15e' : '#83c5be'  // Set color based on category
      },
      // Store complete tweet information
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

// Handle chart click event
const handleChartClick = (params: ChartClickParams): void => {
  // If clicking on a scatter plot point
  if (params.seriesType === 'scatter') {
    // Update selected point
    selectedPoint.value = params.data as ScatterDataPoint
    updateChartOptions()
  }
  // If clicking on the outer ring of the pie chart (tweet samples)
  else if (params.seriesType === 'pie' && params.seriesIndex === 2) {
    // Click on outer ring, show tweet details
    selectedTweet.value = params.data.tweetInfo
  }
  // If clicking on y-axis label (emotion categories)
  else if (params.componentType === 'yAxis') {
    // Toggle selection: if the same emotion is clicked again, clear the selection
    if (selectedEmotion.value === params.value) {
      selectedEmotion.value = null
    } else {
      selectedEmotion.value = params.value as string
      // Clear point selection when switching emotions
      selectedPoint.value = null
    }
    updateChartOptions()
  }
}

// Update chart configuration
const updateChartOptions = (): void => {
  const scatterData = processData()
  const pieData = generateNestedPieData(selectedPoint.value)

  // Configure chart options
  chartOptions.value = {
    tooltip: {
      formatter: function(params: any) {
        if (params.seriesType === 'scatter') {
          return `<div style="font-weight:bold">时间段: ${params.data.timeBlock}</div>` +
                 `情感类型: ${params.data.name}<br/>` +
                 `总点赞数: ${params.data.totalLikes}<br/>` +
                 `总推文数: ${params.data.totalTweets}<br/>` +
                 `<i>点击查看详细内容</i>`
        } else if (params.seriesType === 'pie') {
          if (params.seriesIndex === 1) {
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
        return ''
      }
    },
    grid: {
      left: 180,
      right: selectedPoint.value ? 450 : 20,  // If a point is selected, leave space on the right to display the pie chart
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
        formatter: function(value: string, index: number) {
          return `{${value}|${value}\n${emotions[index].value}}`
        },
        rich: {
          Positive: {
            color: '#f2a1d1',
            fontSize: 14,
            fontWeight: 'bold',
            padding: [10, 0, 0, 0],
            align: 'center',
            opacity: selectedEmotion.value && selectedEmotion.value !== 'Positive' ? 0.05 : 1
          },
          Negative: {
            color: '#e87a7a',
            fontSize: 14,
            fontWeight: 'bold',
            padding: [10, 0, 0, 0],
            align: 'center',
            opacity: selectedEmotion.value && selectedEmotion.value !== 'Negative' ? 0.05 : 1
          },
          Neutral: {
            color: '#b5b5b5',
            fontSize: 14,
            fontWeight: 'bold',
            padding: [10, 0, 0, 0],
            align: 'center',
            opacity: selectedEmotion.value && selectedEmotion.value !== 'Neutral' ? 0.05 : 1
          },
          Emergency: {
            color: '#e7e176',
            fontSize: 14,
            fontWeight: 'bold',
            padding: [10, 0, 0, 0],
            align: 'center',
            opacity: selectedEmotion.value && selectedEmotion.value !== 'Emergency' ? 0.05 : 1
          },
        },
        width: 150,
        backgroundColor: (params: { dataIndex: number }) => {
        const emotionName = emotions[params.dataIndex].name;
        // Apply transparency to background color if not selected
        const alpha = selectedEmotion.value && selectedEmotion.value !== emotionName ? 0.05 : 1;
        const color = emotions[params.dataIndex].color;

        // Convert hex color to rgba with transparency
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
      splitLine: { show: false },
      triggerEvent: true  // Important: This allows clicking on y-axis labels
    },
    series: [
      {
        type: 'scatter',
        symbolSize: function (data: number[]) {
          return data[2];
        },
        data: scatterData
      } as ScatterSeriesOption
    ]
  }

  // If a point is selected, add nested pie chart
  if (selectedPoint.value) {
    // Add title to display the current selected time block and emotion type
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

    // Add inner ring (hot vs others)
    chartOptions.value.series?.push({
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
    } as PieSeriesOption)

    // Add outer ring (tweet samples)
    chartOptions.value.series?.push({
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
    } as PieSeriesOption)
  }
}

// Initialize
onMounted(() => {
  updateChartOptions()
})

// Watch for changes in the selected point and update chart
watch(selectedPoint, () => {
  updateChartOptions()
})

// Watch for changes in the selected emotion and update chart
watch(selectedEmotion, () => {
  updateChartOptions()
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  padding: 20px 0;
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
  height: 500px;
}

/* Tweet details modal styles */
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
