<!-- SankeyChart.vue -->
<template>
  <div class="sankey-container">
    <v-chart class="chart" :option="option" autoresize @chart-ready="handleChartReady" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { SankeyChart } from 'echarts/charts';
import VChart from 'vue-echarts';
import type { ECharts } from 'echarts/core';
import sankeyData from '../assets/sankey_data.json';
import type { RadialGradientObject } from 'echarts';

use([CanvasRenderer, SankeyChart]);

interface SankeyNode {
  name: string;
  category: 'root' | 'main' | 'sub';
  count?: number;
  depth?: number;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

// 处理节点层级
const processedData = ref({
  metadata: sankeyData.metadata,
  nodes: sankeyData.nodes.map((node: { category: string })  => {
    if (node.category === 'root') return { ...node, depth: 0 };
    if (node.category === 'sub') return { ...node, depth: 1 };
    return { ...node, depth: 2 };
  }) as SankeyNode[],
  links: sankeyData.links as SankeyLink[]
});

// 颜色配置
const colorConfig = {
  root: '#5F5D9B',
  main: {
    Positive: '#20BF6B',
    Negative: '#FC5C65',
    Neutral: '#778CA3',
    Emergency: '#FD9644'
  },
  sub: {
    Positive: ['#7FC77F', '#63B863', '#4AAE4A', '#319431'],
    Negative: ['#E67E90', '#D35F74', '#C13C58', '#B12645'],
    Neutral: ['#B7C0C9', '#9CA8B5', '#8392A2', '#6B7B8D'],
    Emergency: ['#FFA96B', '#FF9140', '#FF7916', '#E06000']
  }
};

// 生成节点颜色
const getNodeColor = (node: SankeyNode) => {
  if (node.category === 'root') return colorConfig.root;
  if (node.depth === 2) return colorConfig.main[node.name as keyof typeof colorConfig.main];
  type SubColorKey = keyof typeof colorConfig.sub;
  const mainType = node.name.split('_')[0] as SubColorKey;
  if (!(mainType in colorConfig.sub)) {
    console.warn(`Invalid mainType: ${mainType}`);
    return '#ccc'; // 返回默认颜色
  }
  const subNodes = processedData.value.nodes
    .filter(n => n.category === 'sub' && n.name.startsWith(mainType))
    .sort((a, b) => a.name.localeCompare(b.name));
  return colorConfig.sub[mainType][subNodes.findIndex(n => n.name === node.name) % 4];
};

// 图表配置
const option = ref({
  backgroundColor: {
    type: 'radial',
    x: 0.5,
    y: 0.5,
    r: 0.7,
    colorStops: [
      { offset: 0, color: 'rgba(240,247,255,0.8)' },
      { offset: 1, color: 'rgba(220,230,255,0.2)' }
    ]
  }as RadialGradientObject,
  title: {
  text: '',
  subtext: '',
  left: 'center',
  top: 20, // 增加顶部间距
  padding: [15, 0], // 添加标题容器内边距
  textStyle: {
    color: '#2D3436',
    fontSize: 20,
    fontWeight: 'bold'
  },
  subtextStyle: {
    color: '#636E72',
    fontSize: 14,
    margin: [8, 0, 0, 0]
  }
},
  tooltip: {
    trigger: 'item',
    formatter: (params: any) => {
      if (params.dataType === 'node') {
        return `${params.name}<br>数量：${params.data.count || params.value}`;
      }
      return `${params.source} → ${params.target}<br>数量：${params.value}`;
    }
  },
  series: [{
    type: 'sankey',
    data: processedData.value.nodes.map(node => ({
      name: node.name,
      depth: node.depth,
      itemStyle: {
        color: getNodeColor(node),
        opacity: 1,
        borderWidth: 0
      }
    })),
    links: processedData.value.links,
    emphasis: {
      focus: 'adjacency',
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 2,
        shadowBlur: 12,
        shadowColor: 'rgba(0, 0, 0, 0.3)'
      },
      lineStyle: {
        width: 3,
        opacity: 0.8,
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            { offset: 0, color: '#FFF' },
            { offset: 1, color: '#FFEB3B' }
          ]
        }
      }
    },
    lineStyle: {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 1,
        y2: 0,
        colorStops: [
          { offset: 0, color: 'rgba(255,255,255,0.8)' },
          { offset: 1, color: 'rgba(150,150,150,0.8)' }
        ]
      },
      curveness: 0.35,
      opacity: 0.5
    },
    label: {
      color: 'rgba(0,0,0,0.8)',
      fontSize: 12,
      position: (params: any) => {
        return params.data.depth === 0 ? 'right'
               : params.data.depth === 1 ? 'insideRight'
               : 'left';
      },
      formatter: (params: any) => {
        const depth = params.data.depth;
        const name = params.name.split('_')[1] || params.name;
        return depth === 0 ? `{text|${name}}`
              : depth === 2 ? `{circle|}{bold|${name}}`
              : name;
      },
      rich: {
        bold: {
          fontWeight: 'bold',
          fontSize: 13
        },
        text: {
          color: '#fff',
          padding: [5, 8],
          backgroundColor: '#5F5D9B',
          borderRadius: 15
        },
        circle: {
          width: 6,
          height: 6,
          backgroundColor: (params: any) => getNodeColor(params.data),
          borderRadius: 3,
          verticalAlign: 'middle',
          marginRight: 5
        }
      }
    },
    nodeWidth: 12,
    nodeGap: 8,
    levels: [
      {
        depth: 0,
        itemStyle: { color: colorConfig.root },
        label: { color: '#fff' }
      },
      {
        depth: 1,
        itemStyle: { opacity: 0.8 },
        label: { position: 'right' }
      },
      {
        depth: 2,
        itemStyle: { color: ({ name }: { name: string }) => colorConfig.main[name as keyof typeof colorConfig.main] },
        label: { position: 'left' }
      }
    ],
    animationEasing: 'elasticOut',
    animationDuration: 1500,
    animationDurationUpdate: 700
  }]
});

// 响应式处理
const chartRef = ref<ECharts | null>(null);

const handleChartReady = (chart: ECharts) => {
  chartRef.value = chart;
};

const handleResize = () => {
  chartRef.value?.resize();
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  chartRef.value?.dispose();
});
</script>

<style scoped>
.sankey-container {
  width: 100%;
  height: 100%;
  min-height: 500px;
  padding: 15px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: all 0.4s ease;
  padding: 20px 15px;
}

.sankey-container:hover {
  box-shadow: 0 12px 30px rgba(0,0,0,0.15);
}

.chart {
  width: 100%;
  height: 100%;
}

/* 节点样式优化 */
:deep(.echarts-sankey-node) {
  transition: transform 0.3s;
}

:deep(.echarts-sankey-node[depth="1"]) {
  margin: 10px 0;
}

/* 连线动画 */
:deep(.echarts-sankey-link) {
  transition: opacity 0.3s;
  stroke-dasharray: 5 3;
  animation: linkFlow 20s linear infinite;
}

@keyframes linkFlow {
  from { stroke-dashoffset: 100; }
  to { stroke-dashoffset: 0; }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .sankey-container {
    min-height: 400px;
    padding: 8px;
    border-radius: 8px;
  }

  :deep(.echarts-sankey-node text) {
    font-size: 10px !important;
  }
}

@media (max-width: 480px) {
  .sankey-container {
    min-height: 300px;
  }
}
/* 响应式媒体查询 */
@media (max-width: 1200px) {
  .sankey-container {
    min-height: 450px;
    padding: 12px;
  }

  :deep(.echarts-sankey-node text) {
    font-size: 11px !important;
  }
}

@media (max-width: 992px) {
  .sankey-container {
    min-height: 400px;
    padding: 10px;
  }

  :deep(.echarts-sankey-node text) {
    font-size: 10.5px !important;
  }
}

/* 平板设备优化 */
@media (max-width: 768px) {
  .sankey-container {
    min-height: 350px;
    padding: 8px;
  }

  :deep(.echarts-sankey-node text) {
    font-size: 10px !important;
  }
}

/* 手机设备优化 */
@media (max-width: 480px) {
  .sankey-container {
    min-height: 300px;
    padding: 5px;
  }

  :deep(.echarts-sankey-node text) {
    font-size: 0 !important; /* 完全隐藏标签 */
  }

  :deep(.echarts-sankey-node) {
    cursor: pointer; /* 增强触摸交互 */
  }
}

/* 超小屏幕优化 */
@media (max-width: 360px) {
  .sankey-container {
    min-height: 250px;
  }
}
</style>
