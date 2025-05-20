<!-- //component/WorldMap.vue -->
<template>
  <div ref="chartContainer" class="world-chart-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts/core';
import type { ECharts } from 'echarts/core';
import worldearthquakeData from '@/assets/WorldEarthquakes.json'; // 替换为你的数据文件路径

const chartContainer = ref(null);
let myChart: ECharts | null = null;

// 模拟地震数据（替换成你的真实数据）
const earthquakeData = worldearthquakeData.map(item => ({
  lng: item.lng,
  lat: item.lat,
  mag: item.mag,
  depth: item.depth,
  time: item.year,
}));

let initialGeoConfig = { center: [0, 0], zoom: 1.2 }; // 保存初始状态

const initChart = async () => {
  try {
    // 加载地图数据
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
          dimension: 2, // 震级在第2维
          seriesIndex: 0, // 震级图层
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
          dimension: 3, // 深度在第3维
          seriesIndex: 1, // 深度图层
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
          text: ["2005", "2025"],
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
        roam: true,
        zoomLimit: { max: 8, min: 1 },
        center: initialGeoConfig.center,
        zoom: initialGeoConfig.zoom,
        label: {
          show: false
        },
        itemStyle: {
          areaColor: '#d9d9d9', // 浅绿色地图背景
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

    // 点击缩放到地震点
    myChart?.on('click', function (params) {
      if (params.seriesType === 'scatter' && Array.isArray(params.data?.value)) {
        const [lng, lat] = params.data.value;
        const geoOptions = myChart?.getOption()?.geo as Array<{ zoom?: number }> | undefined;
        const currentZoom = (geoOptions?.[0]?.zoom ?? 1.2);
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
      if (initialGeoConfig.center && initialGeoConfig.zoom && myChart) {
        myChart.setOption({
          geo: [{
            center: initialGeoConfig.center,
            zoom: initialGeoConfig.zoom
          }],
          animationDuration: 1000
        });
      } else {
        console.warn('初始地图配置未正确初始化或 myChart 为 null');
      }
    });

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
  height: 700px;
  min-width: 800px;
}
</style>
