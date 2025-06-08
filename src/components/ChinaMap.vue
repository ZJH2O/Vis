<!-- //component/ChinaMap.vue -->
<template>
  <div class="map-wrapper">
    <div ref="chartContainer" class="world-chart-container"></div>

    <!-- 重置视图按钮：在地图容器外，避免被遮挡 -->
    <button
      ref="resetBtn"
      class="reset-btn"
      @click="resetChart"
      v-show="hasClicked"
    >
      重置视图
    </button>
  </div>
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

echarts.use([
  TooltipComponent,
  VisualMapComponent,
  MapChart,
  LinesChart,
  CanvasRenderer
]);

const provinceStore = useProvinceStore();

const chartContainer = ref(null);
const resetBtn = ref(null);
let myChart: ECharts | null = null;
let hasClicked = ref(false);
let canDrag = ref(false);
const initialZoom = 1.2;
let initialCenter = [105, 38];

const initChart = async () => {
  try {
    const response = await fetch("https://img.isqqw.com/profile/upload/2025/03/06/dea061ec-92cd-41a9-aa64-e50fa4400133.json");
    const ChinaJson = await response.json();
    echarts.registerMap('China', ChinaJson);

    const totalValue = provinceData.reduce((sum, item) => sum + item.value, 0);

    const option = {
      tooltip: {
        trigger: "item",
        formatter: (params) => {
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
          roam: false,
          zoom: initialZoom,
          center: initialCenter,
          zoomLimit: { max: 5.0, min: initialZoom },
          scaleLimit: {
            min: 1.0,
            max: 5.0
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

    if (myChart) {
      myChart.setOption(option);
    }

    myChart?.on('click', function () {
      hasClicked.value = true;

      myChart?.setOption({
        series: [{ roam: 'scale' }]
      });
    });

    myChart?.on('click', (params) => {
      if (params.componentType === 'series' && params.seriesType === 'map') {
        if (params.name === provinceStore.selectedProvince) {
          provinceStore.resetProvince();
        } else {
          provinceStore.setSelectedProvince(params.name);
        }
      }
    });

    myChart?.on('georoam', function () {
      if (!hasClicked.value) return;

      const geoOption = myChart?.getOption().series[0];
      const currentZoom = geoOption.zoom;
      canDrag.value = currentZoom > initialZoom;

      myChart?.setOption({
        series: [
          {
            roam: canDrag.value ? true : 'scale'
          }
        ]
      });
    });

    myChart?.on('dblclick', function () {
      resetChart();
    });

    window.addEventListener('resize', handleResize);
  } catch (error) {
    console.error('Error loading map data:', error);
  }
};

const resetChart = () => {
  if (myChart) {
    myChart.setOption({
      series: [
        {
          center: initialCenter,
          zoom: initialZoom
        }
      ],
      animationDuration: 500
    });

    hasClicked.value = false;
    canDrag.value = false;

    myChart.setOption({
      series: [
        {
          roam: false
        }
      ]
    });
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
.map-wrapper {
  position: relative;
  width: 100%;
  height: 500px;
  min-width: 800px;
}

/* 地图容器 */
.world-chart-container {
  width: 100%;
  height: 100%;
}

/* 重置按钮样式 */
.reset-btn {
  position: absolute;
  right: 20px;
  bottom: 20px;
  padding: 8px 16px;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  z-index: 9999; /* 确保在最上层 */
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.reset-btn:hover {
  background-color: rgba(240, 240, 240, 0.9);
  transform: translateY(-2px);
}

.reset-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

</style>
