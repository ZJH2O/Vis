<!-- //component/ChinaMap.vue -->
<template>
  <div ref="chartContainer" class="world-chart-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts/core';
import { TooltipComponent, VisualMapComponent } from 'echarts/components';
import { MapChart, LinesChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import type { ECharts } from 'echarts/core';
import provinceData from '@/assets/province_earthquake_counts_fullname.json';
import { useProvinceStore } from '@/stores/province';
// 注册必要的组件
echarts.use([
  TooltipComponent,
  VisualMapComponent,
  MapChart,
  LinesChart,
  CanvasRenderer
]);

const provinceStore = useProvinceStore();

const chartContainer = ref(null);
let myChart:ECharts|null = null;

// // 示例数据
// const provinceData = [
//   { name: "贵州省", value: 25 },
//   { name: "青海省", value: 1 },
// ];

const initChart = async () => {
  try {
    // 加载地图数据
    const response = await fetch("https://img.isqqw.com/profile/upload/2025/03/06/dea061ec-92cd-41a9-aa64-e50fa4400133.json");
    const ChinaJson = await response.json();
    echarts.registerMap('China',ChinaJson);
    const totalValue = provinceData.reduce((sum, item) => sum + item.value, 0);
    const option = {
    tooltip: {
      trigger: "item",
      formatter: (params: { seriesType: string; name: string; data: { value: number; fromName?: string; toName?: string }; color: string }) => {
        if (params.data && params.seriesType !== 'lines') {
          if (params.data.value) {
            const currentValue = params.data.value;
            const percentage = ((currentValue / totalValue) * 100).toFixed(2);
            return `${params.name}<br/>地震次数: ${currentValue}<br/>占比 ${percentage}%`;
          }
        } else if (params.seriesType === 'lines') {
          return `${params.data.fromName} → ${params.data.toName}<br/>数量: ${params.data.value}`;
        }
        return `${params.name}<br/>无数据`;
      },
    },
    visualMap: {
      min: 0,
      max: Math.max(...provinceData.map((item) => item.value)),
      left: "right",
      inRange: {
        color: ["#d3f9d8", "#5cb85c", "#2a7f2a"],
      },
      text: ["高", "低"],
      calculable: true,
    },
    series: [
      {
        name: "地震次数",
        type: "map",
        map: "China",
        roam: true,
        zoom: 1.2,
        scaleLimit: {
          min: 1.0,  // 禁止缩小到初始尺寸以下
          max: 5.0   // 最大放大5倍
        },
        label: {
          show: false,
        },
        itemStyle: {
          areaColor: "#eafae6",
          borderColor: "#ccc",
          borderWidth: 1,
        },
        emphasis: {
          label: {
            show: true,
            color: "#fff",
            fontSize: 12,
          },
          itemStyle: {
            areaColor: "#FFD700",
          },
        },
        data: provinceData,
      },
    ],

  };

    if(myChart){
      myChart.setOption(option);
    }
    // 添加地图点击事件监听
    myChart?.on('click', (params) => {

      if (params.componentType === 'series' && params.seriesType === 'map') {
        if(params.name === provinceStore.selectedProvince){
        provinceStore.resetProvince()
        }
        else{
          provinceStore.setSelectedProvince(params.name)
        }
      }
    })

    window.addEventListener('resize', handleResize);
  } catch (error) {
    console.error('Error loading map data:', error);
  }
};

const handleResize = () => {
  if (myChart) {
    myChart.resize();
  }
};

onMounted(() => {
  myChart = echarts.init(chartContainer.value);
  initChart();
});

onBeforeUnmount(() => {
  if (myChart) {
    window.removeEventListener('resize', handleResize);
    myChart.dispose();
    myChart = null;
  }
});
</script>

<style scoped>
.world-chart-container {
  width: 100%;
  height: 500px;
  min-width: 800px;
}
</style>
