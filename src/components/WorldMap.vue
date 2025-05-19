<template>
  <div ref="chartContainer" class="world-chart-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts/core';
import type { ECharts } from 'echarts/core';
import worldearthquakeData from '@/assets/WorldEarthquakes.json';

const chartContainer = ref(null);
let myChart: ECharts | null = null;

const earthquakeData = worldearthquakeData.map(item => ({
  lng: item.lng,
  lat: item.lat,
  mag: item.mag,
  depth: item.depth,
  time: item.year,
}));

let initialGeoConfig = { center: [0, 0], zoom: 1.2 };

const initChart = async () => {
  try {
    const response = await fetch("https://img.isqqw.com/profile/upload/2025/03/11/b90bf3d4-6c6f-4ef1-acd1-4edd925acaed.json");
    const worldJson = await response.json();
    echarts.registerMap('world', worldJson);

    const option = {
      tooltip: {
        trigger: "item",
        backgroundColor: 'rgba(2,28,53,0.9)',
        borderColor: '#3FD2E5',
        borderWidth: 1,
        padding: [12, 24],
        textStyle: {
          color: '#FFF',
          fontSize: 14
        },
        formatter: (params: any) => {
          if (params.seriesType === 'scatter' && params.data?.value?.length >= 5) {
            const [lng, lat, mag, depth, time] = params.data.value;
            return `
              <div style="border-bottom:1px solid #3FD2E5;padding-bottom:8px;margin-bottom:8px">
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
            symbolSize: [10, 18]
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
          max: Math.max(...earthquakeData.map(i => i.time)),
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
            opacity: 0.85,
            borderWidth: 1.5,
            borderColor: 'rgba(255,255,255,0.8)',
            shadowBlur: 15,
            shadowColor: 'rgba(58,139,255,0.5)'
          },
          emphasis: {
            itemStyle: {
              color: '#3A8BFF',
              opacity: 1,
              borderColor: '#ffffff',
              borderWidth: 0.8,
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
          symbolSize: (val: number[]) => 4 + (val[2] - 7) * 1.2,
          itemStyle: {
            borderColor: '#333',
            borderWidth: 0.5
          },
          z: 2
        }
      ],
      geo: {
        map: 'world',
        roam: true,
        zoomLimit: { max: 8, min: 1 },
        center: initialGeoConfig.center,
        zoom: initialGeoConfig.zoom,
        label: { show: false },
        itemStyle: {
          areaColor: '#C8E6C9',
          borderColor: '#F4C2C2',
          borderWidth: 0.8
        },
        emphasis: {
          itemStyle: {
            areaColor: '#A5D6A7',
            borderColor: '#F4C2C2',
            borderWidth: 1.2
          }
        }
      }
    };

    if (myChart) {
      myChart.setOption(option);
    }

    setTimeout(() => {
      const currentOption = myChart?.getOption();
      if (currentOption?.geo?.[0]) {
        initialGeoConfig = {
          center: currentOption.geo[0].center,
          zoom: currentOption.geo[0].zoom
        };
      }
    }, 500);

    myChart?.on('click', function (params) {
      if (params.seriesType === 'scatter' && Array.isArray(params.data?.value)) {
        const [lng, lat] = params.data.value;
        const currentZoom = myChart?.getOption()?.geo?.[0]?.zoom ?? 1.2;
        myChart?.setOption({
          geo: [{
            center: [lng, lat],
            zoom: Math.min(currentZoom * 1.5, 8)
          }]
        });
      }
    });

    myChart?.on('dblclick', function () {
      myChart?.setOption({
        geo: [{
          center: initialGeoConfig.center,
          zoom: initialGeoConfig.zoom
        }],
        animationDuration: 1000
      });
    });

    window.addEventListener('resize', handleResize);
  } catch (error) {
    console.error('Error loading map data:', error);
  }
};

const handleResize = () => {
  myChart?.resize();
};

onMounted(() => {
  myChart = echarts.init(chartContainer.value);
  initChart();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  myChart?.dispose();
  myChart = null;
});
</script>

<style scoped>
.world-chart-container {
  width: 100%;
  height: 500px;
  min-width: 800px;
}
</style>
