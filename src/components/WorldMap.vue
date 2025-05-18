<!-- //component/WorldMap.vue -->
<template>
  <div ref="chartContainer" class="world-chart-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts/core';
import type { ECharts } from 'echarts/core';
import worldearthquakeData from '@/assets/WorldEarthquakes.json'; // 替换为你的数据文件路径
// 注册必要的组件

// 定义时间轴选项类型

const chartContainer = ref(null);
let myChart:ECharts|null = null;

// 模拟地震数据（替换成你的真实数据）
const earthquakeData = worldearthquakeData.map(item => ({
  lng: item.lng,
  lat: item.lat,
  mag: item.mag,
  depth: item.depth,
  time: item.year,
}));
let initialGeoConfig = {center:[0,0],zoom:1.2}; // 用于保存初始状态

//const times = Array.from(new Set(earthquakeData.map(item => item.time)))

const initChart = async () => {
  try {
    // 加载地图数据
    const response = await fetch("https://img.isqqw.com/profile/upload/2025/03/11/b90bf3d4-6c6f-4ef1-acd1-4edd925acaed.json");
    const worldJson = await response.json();
    echarts.registerMap('world', worldJson);
    // 飞线数据（示例）
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
        formatter: (params: { seriesType: string; data: { value: number[] }; color: string }) => {
          if (params.seriesType === 'scatter' && params.data.value[2] >= 7) {
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
    dimension: 2,          // 假設震級在數據維度2
    text: ['9級', '7級'],
    inRange: {
      symbolSize: [5, 15] // 僅用震級控制大小，移除顏色設置
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
    dimension: 3,          // 假設深度在數據維度3
    text: ['深源', '淺源'],
    inRange: {
      color: ['#FF6B6B', '#FFD700'] // 僅用深度控制顏色
    },
    right: '5%',
    bottom: '15%'
  },
  {
    type: 'continuous',
    min: 2005,
    max: Math.max(...earthquakeData.map((item) => item.time)),
    orient: 'horizontal',   // 关键参数：横向布局
    left: 'center',           // 左边界留空 10%
    bottom: '5%',
    dimension: 4,          // 假設時間在數據維度4
    text: ["2005", "2025"],
    calculable: true,
    inRange: {
      opacity: [0.3, 1]    // 用透明度或符號類型表示時間
    }
  }
],
      series: [{
        type: 'scatter',
        coordinateSystem: 'geo',
        data: earthquakeData.filter(d => d.mag > 7).map(d => ({
          value: [d.lng, d.lat, d.mag, d.depth,d.time],
          name: `${d.mag}级地震`
        })),
        symbolSize: (val: number[]) => {
          const baseMag = 7;    // 基准震级
          const baseSize = 7;  // 基准尺寸
          const scaleFactor = 5; // 每级放大系数

          return baseSize + (val[2] - baseMag) * scaleFactor;
        } ,// 动态大小计算
        encode: {
          lng: 0,
          lat: 1,
          tooltip: [2, 3]
        },
        itemStyle: {
          opacity: 0.85,
          borderWidth: 1.5,
          borderColor: 'rgba(255,255,255,0.8)',
          shadowBlur: 15,
          shadowColor: 'rgba(58,139,255,0.5)'
        },
        emphasis: {
          itemStyle: {
            opacity: 1,
            shadowBlur: 25,
            shadowColor: '#3A8BFF'
          },
        },
        animationDelay: (idx: number) => idx * 50 // 数据加载动画
      }],
      geo: {
        map: 'world',
        roam: true,
        zoomLimit: { max: 8, min: 1 }, // 限制缩放范围
        center: initialGeoConfig.center,
        zoom: initialGeoConfig.zoom,
        label: {
          show: false // 隐藏国家标签
        },
        itemStyle: {
          areaColor: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: '#1B3A6F' // 海洋深蓝
            }, {
              offset: 1, color: '#0A1930' // 深海颜色
            }]
          },
          borderColor: 'rgba(58,139,255,0.3)',
          borderWidth: 0.8
        },
        emphasis: {
          itemStyle: {
            areaColor: '#2A4F8D', // 高亮国家颜色
            borderColor: '#3A8BFF',
            borderWidth: 1.2
          }
        }
      }
    };



    if (myChart) {
      myChart.setOption(option);
    }

    // 获取地图初始状态（延迟确保渲染完成）
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
    // 添加点击事件监听

    myChart?.on('click', function(params) {
      if (params.seriesType === 'scatter' && typeof params.data === 'object' && params.data !== null && 'value' in params.data && Array.isArray(params.data.value)) {
      // 获取点击点的坐标和当前缩放级别
      const [lng, lat] = params.data.value;
      const geoOptions = myChart?.getOption()?.geo as Array<{ zoom?: number }> | undefined;
      const currentZoom = (geoOptions?.[0]?.zoom ?? 1.2);

      // 计算新的中心点和缩放级别
      myChart?.setOption({
        geo: [{
        center: [lng, lat],
        zoom: Math.min(currentZoom * 1.5, 8) // 限制最大缩放级别为 8
        }]
      });
      }
    });

    // 右键事件处理（添加类型守卫）
    myChart?.on('dblclick', function() {

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
    // 打印地图注册信息
    console.log('已注册地图:', echarts.getMap('central_america'));
    // 3. 调试方法：强制显示所有元素
    setTimeout(() => {
          if (myChart) {
            myChart.dispatchAction({
              type: 'showTip',
              seriesIndex: 0,
              dataIndex: 0
            });
          } else {
            console.warn('myChart is null, cannot dispatch action.');
          }
        }, 1000);

    // 验证数据坐标
    console.log('地震点坐标:', earthquakeData.map(d => [d.lng, d.lat]));
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

