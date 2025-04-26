<!-- //component/WorldMap.vue -->
<template>
  <div ref="chartContainer" class="world-chart-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts/core';
import type { ECharts } from 'echarts/core';

// 注册必要的组件


const chartContainer = ref(null);
let myChart:ECharts|null = null;

// 模拟地震数据（替换成你的真实数据）
const earthquakeData = [
  // 哥斯达黎加境内地震点
  { lng: -84.0, lat: 10.0, mag: 6.3, depth: 35 }, // San José附近
  { lng: -85.5, lat: 10.5, mag: 5.8, depth: 20 }, // 尼加拉瓜湖区域
  // 尼加拉瓜境内地震点
  { lng: -86.0, lat: 12.0, mag: 6.1, depth: 50 }  // 马那瓜附近
];
let initialGeoConfig = {center:[0,0],
zoom:1.2}; // 用于保存初始状态

const initChart = async () => {
  try {
    // 加载地图数据
    const response = await fetch("https://img.isqqw.com/profile/upload/2025/03/11/b90bf3d4-6c6f-4ef1-acd1-4edd925acaed.json");
    const worldJson = await response.json();
    echarts.registerMap('world', worldJson);
    console.log('地图注册验证:', echarts.getMap('central_america')); // 应该显示完整地图对象
    // 飞线数据（示例）
    const option = {
      tooltip: {
        trigger: "item",
        formatter: (params) => {
          if (params.seriesType === 'scatter') {
            // 正确访问数据字段
            const lng = params.data.value[0].toFixed(2);
            const lat = params.data.value[1].toFixed(2);
            const mag = params.data.value[2];
            const depth = params.data.value[3];

            return `震中位置: ${lng}°E, ${lat}°N<br>
                    震级: ${mag}<br>
                    深度: ${depth}公里`;
          }
          return params.name;
        }
      },
      visualMap: [
        {
          type: 'continuous',
          min: 5,
          max: 7,
          dimension: 2, // 绑定到 value[2] (mag)
          text: ['强震', '弱震'],
          inRange: { color: ['#FFD700', '#FF4500'] },
          left: '5%',
          bottom: '10%'
        },
        {
          type: 'continuous',
          min: 0,
          max: 200,
          dimension: 3, // 绑定到 value[3] (depth)
          text: ['浅源', '深源'],
          inRange: { symbolSize: [10, 30] },
          right: '5%',
          bottom: '10%'
        }
      ],
      series: [{
        type: 'scatter',
        coordinateSystem: 'geo',
        symbol: 'circle',
        data: earthquakeData.map(d => ({
          value: [d.lng, d.lat, d.mag, d.depth],
          name: `${d.mag}级地震`
        })),
        symbolSize: val => Math.sqrt(val[2]) * 6, // 震级越大符号越大
        encode: {
          lng: 0,
          lat: 1,
          tooltip: [2, 3]
        },
        itemStyle: {
          opacity: 0.9,
          borderWidth: 1,
          borderColor: '#FFF'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(255,0,0,0.5)'
          }
        }
      }
    ],
    geo: {
          map: 'world',
          roam: true,
          center: [0, 0],
          zoom: 1.2,
          itemStyle: {
            areaColor: '#E6F3FF',
            borderColor: '#4A90E2'
          }
     },
  };

    myChart.setOption(option);

    // 获取地图初始状态（延迟确保渲染完成）
    setTimeout(() => {
      const currentOption = myChart.getOption();
      initialGeoConfig = {
        center: currentOption.geo[0].center,
        zoom: currentOption.geo[0].zoom
      };
      console.log('初始地图状态已记录:', initialGeoConfig);
    }, 500);
    // 添加点击事件监听

    myChart.on('click', { seriesIndex: 0 }, function(params) {
      if (params.seriesType === 'scatter') {
        // 获取点击点的坐标和当前缩放级别
        const [lng, lat] = params.data.value;
        const currentZoom = myChart.getOption().geo.zoom || 1.2;

        // 计算新的中心点和缩放级别
        myChart.setOption({
          geo: {
            center: [lng, lat],
            zoom: currentZoom * 15
          }
        });
      }
    });

    // 右键事件处理（添加类型守卫）
    myChart.on('dblclick', function(params) {

      if (initialGeoConfig.center && initialGeoConfig.zoom) {
        myChart.setOption({
          geo: [{
            center: initialGeoConfig.center,
            zoom: initialGeoConfig.zoom
          }],
          animationDuration: 1000
        });
      } else {
        console.warn('初始地图配置未正确初始化');
      }
    });


    window.addEventListener('resize', handleResize);
    // 打印地图注册信息
    console.log('已注册地图:', echarts.getMap('central_america'));
    // 3. 调试方法：强制显示所有元素
    setTimeout(() => {
          myChart.dispatchAction({
            type: 'showTip',
            seriesIndex: 0,
            dataIndex: 0
          });
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

