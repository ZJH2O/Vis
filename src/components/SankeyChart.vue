<!-- SankeyChart.vue -->
<template>
  <div class="sankey-container">
    <v-chart class="chart" :option="option" autoresize />
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

// 配置ECharts组件
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
  nodes: sankeyData.nodes.map((node: SankeyNode) => {
    if (node.category === 'root') return { ...node, depth: 0 };
    if (node.category === 'sub') return { ...node, depth: 1 };  // sub节点在中间层
    return { ...node, depth: 2 };                               // main节点在右侧
  }) as SankeyNode[],
  links: sankeyData.links as SankeyLink[]
});

// 颜色配置系统
const colorConfig = {
  root: '#888',
  main: {
    Positive: '#4CAF50',
    Negative: '#F44336',
    Neutral: '#9E9E9E',
    Emergency: '#FF9800'
  },
  sub: {
    Positive: ['#C8E6C9', '#A5D6A7', '#81C784', '#66BB6A'],
    Negative: ['#FFCDD2', '#EF9A9A', '#E57373', '#EF5350'],
    Neutral: ['#F5F5F5', '#EEEEEE', '#E0E0E0', '#BDBDBD'],
    Emergency: ['#FFE0B2', '#FFCC80', '#FFB74D', '#FFA726']
  }
};

// 图表配置
const option = ref({
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
    layout: 'none',
    data: processedData.value.nodes.map(node => ({
      name: node.name,
      depth: node.depth,
      itemStyle: {
        color: getNodeColor(node)
      }
    })),
    links: processedData.value.links,
    emphasis: {
      focus: 'adjacency'
    },
    lineStyle: {
      color: 'gradient',
      curveness: 0.25,
      opacity: 0.2
    },
    label: {
      color: 'rgba(0,0,0,0.8)',
      fontSize: 12,
      formatter: (params: any) => {
        const parts = params.name.split('_');
        return parts.length > 1 ? parts[1] : parts[0];
      }
    },
    nodeWidth: 12,
    nodeGap: 8,
    levels: [
      {  // 根节点层
        depth: 0,
        itemStyle: { color: colorConfig.root },
        label: { color: '#fff' }
      },
      {  // 中间sub节点层
        depth: 1,
        itemStyle: { opacity: 0.8 },
        label: { position: 'right' }
      },
      {  // 右侧main节点层
        depth: 2,
        itemStyle: { color: ({ name }: { name: string }) => colorConfig.main[name] },
        label: { position: 'left' }
      }
    ],
    layout: {
      nodeAlignment: 'justify',
      nodeGap: 15
    },
    animationDurationUpdate: 800
  }]
});

// 节点颜色生成器
function getNodeColor(node: SankeyNode) {
  if (node.category === 'root') return colorConfig.root;
  if (node.depth === 2) return colorConfig.main[node.name];

  const mainType = node.name.split('_')[0];
  const subNodes = processedData.value.nodes
    .filter(n => n.category === 'sub' && n.name.startsWith(mainType))
    .sort((a, b) => a.name.localeCompare(b.name));

  return colorConfig.sub[mainType][subNodes.findIndex(n => n.name === node.name) % 4];
}

// 响应式处理
let observer: ResizeObserver;

onMounted(() => {
  const container = document.querySelector('.sankey-container');
  if (container) {
    observer = new ResizeObserver(entries => {
      entries.forEach(entry => {
        const chart = (entry.target as HTMLElement).querySelector('.chart') as any;
        if (chart?.__vue__?.chart) {
          chart.__vue__.chart.resize();
        }
      });
    });
    observer.observe(container);
  }
});

onBeforeUnmount(() => {
  observer?.disconnect();
});
</script>

<style scoped>
.sankey-container {
  width: 100%;
  height: 100%;
  min-height: 500px;
  padding: 15px;
}

.chart {
  width: 100%;
  height: 100%;
}

/* 深度样式覆盖 */
:deep(.echarts-sankey-node) {
  transition: transform 0.3s;
}

:deep(.echarts-sankey-node[depth="1"]) {
  margin: 10px 0;
}

:deep(.echarts-sankey-node text) {
  font-size: 12px !important;
  fill: #666 !important;
  font-family: 'Microsoft YaHei', sans-serif;
}

:deep(.echarts-sankey-link) {
  transition: opacity 0.3s;
}

:deep(.echarts-sankey-link:hover) {
  opacity: 0.6 !important;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .sankey-container {
    min-height: 400px;
    padding: 8px;
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
