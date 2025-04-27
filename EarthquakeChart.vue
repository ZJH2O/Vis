<template>
  <div class="p-4">
    <!-- 下拉选择框 -->
    <select v-model="selectedProvince" @change="updateChart" class="border p-2 rounded mb-4">
      <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
    </select>

    <!-- 图表容器 -->
    <div ref="chartRef" style="width: 1000px; height: 500px;"></div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import { onMounted, ref, watch, nextTick } from 'vue'
import earthquakeData from '../assets/地震统计_完整版.json'

const chartRef = ref(null)
let myChart = null

// 省份列表（去重提取）
const provinces = Array.from(new Set(earthquakeData.map(item => item.省份)))

const selectedProvince = ref('全国')  // 默认显示全国

// 更新图表
function updateChart() {
  const data = earthquakeData.filter(d => d.省份 === selectedProvince.value)

  const years = data.map(d => d.年份)
  const counts = data.map(d => d.地震次数)
  const magnitudes = data.map(d => d['平均震级（M）'])

  const option = {
    title: {
      text: `${selectedProvince.value} 地震统计`,
      left: 'center',  // 确保标题居中显示
      top: '1px%'  // 增加顶部间距，避免与按钮重叠
    },
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['地震次数', '平均震级（M）'],
      top: '10px%'  // 调整图例的位置，避免与标题重叠
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '20%',  // 增加顶部间距，确保标题不被遮挡
      bottom: '15%'  // 增加底部间距，避免标签被截断
    },
    xAxis: {
      type: 'category',
      data: years,
      axisLabel: {
        interval: years.length > 20 ? Math.floor(years.length / 10) : 0,  // 根据数据量调整间隔
        rotate: years.length > 20 ? 45 : 0  // 旋转标签，防止重叠
      }
    },
    yAxis: [
      { type: 'value', name: '地震次数' },
      { type: 'value', name: '平均震级（M）' }
    ],
    series: [
      {
        name: '地震次数',
        type: 'line',
        yAxisIndex: 0,
        data: counts,
        smooth: true,
        lineStyle: { color: '#5470C6' }
      },
      {
        name: '平均震级（M）',
        type: 'bar',
        yAxisIndex: 1,
        data: magnitudes,
        itemStyle: { color: '#91CC75' }
      }
    ]
  }

  myChart.setOption(option)
}

// 初始化图表
onMounted(() => {
  myChart = echarts.init(chartRef.value)
  updateChart()

  // 监听窗口大小变化，自适应调整图表
  window.addEventListener('resize', () => {
    myChart.resize()  // 当窗口大小变化时，重新调整图表尺寸
  })

  // 当页面加载完成后，保证图表尺寸自适应
  nextTick(() => {
    myChart.resize()
  })
})

// 监听省份变化，更新图表
watch(selectedProvince, () => {
  updateChart()
})
</script>

<style scoped>
/* 简单美化一下 */
select {
  min-width: 200px;
}
</style>
