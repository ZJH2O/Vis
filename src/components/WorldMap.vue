<!-- //component/WorldMap.vue -->
<template>
  <div class="world-chart-wrapper">
    <div ref="chartContainer" class="world-chart-container">
      <!-- echarts 图表会在这里渲染 -->
    </div>
    <button
      ref="resetBtn"
      class="reset-btn"
      @click="resetChart"
    >
      重置视图
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts/core';
import type { ECharts } from 'echarts/core';
import worldearthquakeData from '@/assets/WorldEarthquakes.json';

const chartContainer = ref(null);
const resetBtn = ref(null);
let myChart: ECharts | null = null;
let hasClicked = ref(false); // 用户是否点击过地图
let canDrag = ref(false); // 控制是否允许拖动
let initialGeoConfig = { center: [0, 0], zoom: 1.2 }; // 保存初始状态
let originalOption: any = null; // 保存原始配置

const earthquakeData = worldearthquakeData.map(item => ({
  lng: item.lng,
  lat: item.lat,
  mag: item.mag,
  depth: item.depth,
  time: item.year,
}));

const initChart = async () => {
  try {
    const response = await fetch("https://img.isqqw.com/profile/upload/2025/03/11/b90bf3d4-6c6f-4ef1-acd1-4edd925acaed.json");
    const worldJson = await response.json();
    echarts.registerMap('world', worldJson);

    const option = {
      tooltip: {
        trigger: "item",
        backgroundColor: '#ffffff',
        borderColor: '#3FD2E5',
        borderWidth: 1,
        padding: [12, 24],
        textStyle: {
          fontSize: 14
        },
        formatter: (params: any) => {
          if (params.seriesType === 'scatter' && params.data?.value?.length >= 5) {
            const [lng, lat, mag, depth, time] = params.data.value;
            return `<div style="border-bottom:1px solid #3FD2E5;padding-bottom:8px;margin-bottom:8px">
                      <i style="display:inline-block;width:8px;height:8px;background:${params.color};border-radius:50%"></i>
                      <strong style="margin-left:6px">${mag}级地震</strong>
                    </div>
                    <div>经度: ${lng.toFixed(2)}°E</div>
                    <div>纬度: ${lat.toFixed(2)}°N</div>
                    <div>深度: ${depth}公里</div>
                    <div>时间: ${time}年</div>`;
          }
          return null;
        }
      },
      visualMap: [
        {
          type: 'continuous',
          min: 7,
          max: 9,
          dimension: 2,
          seriesIndex: 0,
          text: ['9级', '7级'],
          inRange: {
            symbolSize: [12, 30]
          },
          textStyle: { color: '#666' },
          left: '5%',
          bottom: '15%',
          precision: 1
        },
        {
          type: 'continuous',
          min: 0,
          max: 700,
          dimension: 3,
          seriesIndex: 1,
          text: ['深源', '浅源'],
          inRange: {
            color: ['#FF6B6B', '#FFD700']
          },
          right: '5%',
          bottom: '15%'
        },
        {
          type: 'continuous',
          min: 2005,
          max: Math.max(...earthquakeData.map((item) => item.time)),
          orient: 'horizontal',
          left: 'center',
          bottom: '5%',
          dimension: 4,
          text: ["2025", "2005"],
          calculable: true,
          inRange: {
            opacity: [0.3, 1]
          }
        }
      ],
      series: [
        {
          name: '外圈震级',
          type: 'scatter',
          coordinateSystem: 'geo',
          data: earthquakeData.filter(d => d.mag > 7).map(d => ({
            value: [d.lng, d.lat, d.mag, d.depth, d.time],
            name: `${d.mag}级地震`
          })),
          symbol: 'circle',
          symbolSize: (val: number[]) => 10 + (val[2] - 7) * 2,
          itemStyle: {
            color: '#3A8BFF',
            opacity: 0.6,
            borderColor: '#ffffff',
            borderWidth: 0.8
          },
          z: 1,
          encode: {
            lng: 0,
            lat: 1,
            tooltip: [2, 3]
          },
          emphasis: {
            itemStyle: {
              opacity: 1,
              shadowBlur: 10,
              shadowColor: '#3A8BFF'
            }
          }
        },
        {
          name: '内圈深度',
          type: 'scatter',
          coordinateSystem: 'geo',
          data: earthquakeData.filter(d => d.mag > 7).map(d => ({
            value: [d.lng, d.lat, d.mag, d.depth, d.time],
            name: `${d.mag}级地震`
          })),
          symbol: 'circle',
          symbolSize: (val: number[]) => 8 + (val[2] - 7) * 1.2,
          itemStyle: {
            borderColor: '#333',
            borderWidth: 0.5
          },
          z: 2,
          encode: {
            lng: 0,
            lat: 1,
            tooltip: [2, 3]
          }
        }
      ],
      geo: {
        map: 'world',
        roam: false, // 初始禁用所有漫游功能
        zoomLimit: { max: 8, min: initialGeoConfig.zoom },
        center: initialGeoConfig.center,
        zoom: initialGeoConfig.zoom,
        label: {
          show: false
        },
        itemStyle: {
          areaColor: '#d9d9d9',
          borderColor: '#969696',
          borderWidth: 0.8
        },
        emphasis: {
          itemStyle: {
            areaColor: '#A5D6A7',
            borderColor: '#ffffff',
            borderWidth: 1.5
          }
        }
      }
    };

    if (myChart) {
      // 保存原始配置
      originalOption = JSON.parse(JSON.stringify(option));
      myChart.setOption(option);
    }

    setTimeout(() => {
      if (myChart) {
        const currentOption = myChart.getOption();
        if (currentOption.geo && Array.isArray(currentOption.geo) && currentOption.geo[0]) {
          initialGeoConfig = {
            center: currentOption.geo[0].center,
            zoom: currentOption.geo[0].zoom
          };
          console.log('初始地图状态已记录:', initialGeoConfig);
        } else {
          console.warn('Geo configuration is missing or invalid in the chart options.');
        }
      } else {
        console.warn('myChart is null.');
      }
    }, 500);

    // 点击地图后允许缩放
    myChart?.on('click', function (params) {
      hasClicked.value = true;

      // 允许缩放但不允许拖动
      myChart?.setOption({
        geo: {
          roam: 'scale'
        }
      });
    });

    // 点击缩放到地震点
    myChart?.on('click', function (params) {
      if (params.seriesType === 'scatter' && Array.isArray(params.data?.value)) {
        const [lng, lat] = params.data.value;
        const geoOptions = myChart?.getOption()?.geo as Array<{ zoom?: number }> | undefined;
        const currentZoom = (geoOptions?.[0]?.zoom ?? initialGeoConfig.zoom);
        myChart?.setOption({
          geo: [{
            center: [lng, lat],
            zoom: Math.min(currentZoom * 1.5, 8)
          }]
        });
      }
    });

    // 双击重置地图
    myChart?.on('dblclick', function () {
      resetChart();
    });

    // 监听地图缩放事件
    myChart?.on('georoam', function () {
      if (!hasClicked.value) return;

      const geoOption = myChart?.getOption().geo[0];
      const currentZoom = geoOption.zoom;

      // 缩放比例大于初始值时允许拖动，否则只允许缩放
      canDrag.value = currentZoom > initialGeoConfig.zoom;
      myChart?.setOption({
        geo: {
          roam: canDrag.value ? true : 'scale'
        }
      });
    });

    window.addEventListener('resize', handleResize);
  } catch (error) {
    console.error('Error loading map data:', error);
  }
};

// 重置图表到初始状态
const resetChart = () => {
  if (myChart && originalOption) {
    // 重置为原始配置
    myChart.setOption(originalOption);

    // 重置交互状态
    hasClicked.value = false;
    canDrag.value = false;

    // 添加动画效果
    myChart.setOption({
      geo: {
        animation: true,
        animationDuration: 500,
        animationEasing: 'cubicOut'
      }
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
.world-chart-wrapper {
  position: relative;
}

.world-chart-container {
  width: 100%;
  height: 700px;
  min-width: 800px;
}

.reset-btn {
  position: absolute;
  right: 20px;
  bottom: 20px;
  padding: 8px 16px;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  z-index: 10; /* 确保按钮位于 canvas 之上 */
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
