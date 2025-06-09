<!-- SankeyChart.vue -->
<template>
  <div class="dashboard">
    <div class="header">
      <div class="dashboard-title">
        <h1><i class="fas fa-chart-network"></i> 灾情情感分析仪表板</h1>
        <p>基于社交媒体数据的灾情情感流向可视化分析</p>
      </div>
    </div>

    <div class="main-content">
      <div class="sankey-container">
        <div class="chart-header">
          <h2><i class="fas fa-water"></i> 情感流向分析</h2>
          <p>展示从整体到具体情感类别的分布关系</p>
          <div v-if="activeMainCategory" class="interactive-info">
            <i class="fas fa-mouse-pointer"></i>
            当前聚焦: {{ activeMainCategory }}
            <button @click="resetSelection" class="reset-btn">
              <i class="fas fa-times"></i> 取消聚焦
            </button>
          </div>
        </div>
        <v-chart class="chart" :option="sankeyOption" autoresize
                 @chart-ready="handleSankeyReady" @click="handleSankeyClick" />
      </div>

      <div class="right-panel">
        <div class="pie-container">
          <div class="chart-header">
            <h2><i class="fas fa-chart-pie"></i> 情感分类占比</h2>
            <p>主要情感类别的整体分布</p>
          </div>
          <v-chart class="chart" :option="pieOption" autoresize
                   @click="handlePieClick" @chart-ready="handlePieReady" />
        </div>

        <div class="bar-container">
          <div class="chart-header">
            <h2><i class="fas fa-chart-bar"></i>
              <span v-if="activeMainCategory">{{ activeMainCategory }} 子类分布</span>
              <span v-else>四大情感类分布</span>
            </h2>
            <p v-if="activeMainCategory">{{ getCategoryDescription(activeMainCategory) }}</p>
            <p v-else>所有情感类别的分布情况</p>
          </div>
          <v-chart class="chart" :option="barOption" autoresize @chart-ready="handleBarReady" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { SankeyChart, PieChart, BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components';
import VChart from 'vue-echarts';
import type { EChartsOption } from 'echarts';
import type { ECharts } from 'echarts/core';
import sankeyData from '../assets/sankey_data.json';
import type { RadialGradientObject } from 'echarts';

use([
  CanvasRenderer,
  SankeyChart,
  PieChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
]);

// 颜色配置
const colorConfig = {
  root: '#5F5D9B',
  Positive: '#20BF6B',
  Negative: '#FC5C65',
  Neutral: '#778CA3',
  Emergency: '#FD9644'
};

// 当前激活的主分类
const activeMainCategory = ref<string | null>(null);

// 主分类描述信息
const categoryDescriptions = {
  Positive: "正面情感包含希望、感恩和团结等积极情绪，反映社区的正向心理状态",
  Negative: "负面情感包含悲伤、恐惧和愤怒等消极情绪，反映人们对灾情的担忧和痛苦",
  Neutral: "中性情感包含一般性描述和问题，反映信息传播和询问性质的内容",
  Emergency: "紧急情况包含救援、医疗和损害报告，直接关联灾害应对的实际需求"
};

const getCategoryDescription = (category: string) => {
  return categoryDescriptions[category as keyof typeof categoryDescriptions] || "";
};

// 计算桑基图节点颜色 - 简单高效的处理
const getNodeColor = (nodeName: string) => {
  if (nodeName === "Total") return colorConfig.root;

  if (["Positive", "Negative", "Neutral", "Emergency"].includes(nodeName)) {
    return colorConfig[nodeName as keyof typeof colorConfig];
  }

  return colorConfig[nodeName.split('_')[0] as keyof typeof colorConfig];
};

// 获取节点透明度
const getNodeOpacity = (nodeName: string) => {
  if (!activeMainCategory.value) return 1;

  // Total节点始终高亮
  if (nodeName === "Total") return 1;

  // 主分类节点或属于当前主分类的子节点
  if (nodeName === activeMainCategory.value ||
      nodeName.startsWith(activeMainCategory.value)) {
    return 1;
  }

  // 其他节点变暗
  return 0.15;
};

// 获取连线透明度
const getLinkOpacity = (source: string, target: string) => {
  if (!activeMainCategory.value) return 0.5;

  // 涉及当前主分类的连线保持正常
  if (source === activeMainCategory.value ||
      target === activeMainCategory.value ||
      source.startsWith(activeMainCategory.value) ||
      target.startsWith(activeMainCategory.value)) {
    return 0.8;
  }

  // 其他连线变暗
  return 0.15;
};

// 准备桑基图节点数据
const sankeyNodes = computed(() => {
  return sankeyData.nodes.map((node: any) => ({
    name: node.name,
    depth: node.category === 'root' ? 0 : node.category === 'sub' ? 1 : 2,
    count: node.count,
    itemStyle: {
      color: getNodeColor(node.name),
      opacity: getNodeOpacity(node.name)
    }
  }));
});

// 准备连线数据
const sankeyLinks = computed(() => {
  return sankeyData.links.map((link: any) => ({
    ...link,
    lineStyle: {
      color: 'gradient',
      curveness: 0.35,
      opacity: getLinkOpacity(link.source, link.target),
      width: 1
    }
  }));
});

// 获取主分类数据（直接从JSON）
const mainCategoriesData = sankeyData.nodes
  .filter((node: any) => node.category === 'main')
  .map((node: any) => ({
    value: node.count,
    name: node.name,
    itemStyle: { color: colorConfig[node.name as keyof typeof colorConfig] }
  }));

// 桑基图配置
const sankeyOption = computed<EChartsOption>(() => ({
  // backgroundColor: {
  //   type: 'radial',
  //   x: 0.5,
  //   y: 0.5,
  //   r: 0.7,
  //   colorStops: [
  //     { offset: 0, color: 'rgBA(240,247,255,0.8)' },
  //     { offset: 1, color: 'rgba(220,230,255,0.2)' }
  //   ]
  // } as RadialGradientObject,
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderColor: '#e0e6ed',
    borderWidth: 1,
    padding: [10, 15],
    textStyle: {
      color: '#2D3436',
      fontSize: 14
    },
    formatter: (params: any) => {
      if (params.dataType === 'node') {
        return `<div style="font-weight:600;margin-bottom:5px">${params.name}</div>
                <div>数量：${params.data.count || params.value}</div>`;
      }
      return `<div style="font-weight:600;margin-bottom:5px">${params.data.source} → ${params.data.target}</div>
              <div>数量：${params.data.value}</div>`;
    }
  },
  series: [{
    type: 'sankey',
    left: '5%',
    right: '15%',
    top: 50,
    bottom: '15%',
    data: sankeyNodes.value,
    links: sankeyLinks.value,
    emphasis: {
      focus: 'adjacency',
      itemStyle: {
        borderWidth: 0
      },
      lineStyle: {
        width: 2,
        opacity: 0.8
      }
    },
    label: {
      color: '#2D3436',
      fontSize: 12,
      position: (params: any) => {
        const depth = params.data.depth;
        return depth === 0 ? 'right'
               : depth === 1 ? 'insideRight'
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
          backgroundColor: '#5F5D9B',
          borderRadius: 3,
          verticalAlign: 'middle',
          marginRight: 5
        }
      }
    },
    nodeWidth: 12,
    nodeGap: 8,
    levels: [
      { depth: 0 },
      { depth: 1 },
      { depth: 2 }
    ],
    animationEasing: 'elasticOut',
    animationDuration: 1500,
    animationDurationUpdate: 700
  }]
}));

const pieOption = ref<EChartsOption>({
  tooltip: {
    trigger: 'item',
    formatter: (params: any) => {
      const percent = Math.round(params.percent);
      return `${params.name}<br>数量：${params.value} (${percent}%)`;
    }
  },
  legend: {
    orient: 'vertical',
    right: 10,
    top: 'center',
    textStyle: {
      color: 'var(--text-primary)'
    }
  },
  series: [
    {
      name: '情感分类',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: (params: any) => {
          return `{name|${params.name}}\n{value|${params.value}}`;
        },
        rich: {
          name: {
            fontSize: 12,
            fontWeight: 'bold',
            color: '#2D3436', // 默认黑色
            lineHeight: 18
          },
          value: {
            fontSize: 14,
            fontWeight: 'bold',
            color: '#2D3436' // 默认黑色
          }
        }
      },
      emphasis: {
        label: {
          rich: {
            name: {
              color: (params: any) => params.color // 悬停时使用扇区颜色
            },
            value: {
              color: (params: any) => params.color // 悬停时使用扇区颜色
            }
          }
        },
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      data: mainCategoriesData
    }
  ]
});


// 柱状图配置
const getBarOption = () => {
  let barData = [];
  let xAxisData = [];

  if (activeMainCategory.value) {
    // 获取当前主分类的子类数据
    const subCategories = sankeyData.nodes.filter(
      (node: any) => node.category === 'sub' && node.name.startsWith(activeMainCategory.value as string)
    );

    // 生成柱状图数据和标签
    barData = subCategories.map((cat: any) => ({
      value: cat.count,
      itemStyle: { color: colorConfig[activeMainCategory.value as keyof typeof colorConfig] }
    }));

    xAxisData = subCategories.map((cat: any) => cat.name.split('_')[1]);
  } else {
    // 显示四大类数据
    barData = mainCategoriesData.map((cat: any) => ({
      value: cat.value,
      itemStyle: { color: cat.itemStyle.color }
    }));

    xAxisData = mainCategoriesData.map((cat: any) => cat.name);
  }

  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const param = params[0];
        return `<div style="font-weight:600;margin-bottom:5px">${param.name}</div>
                <div>数量：${param.value}</div>`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLine: {
        lineStyle: {
          color: '#e0e6ed'
        }
      },
      axisLabel: {
        color: '#2D3436',
        interval: 0,
        rotate: 0
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#e0e6ed'
        }
      },
      splitLine: {
        lineStyle: {
          color: ['#f0f4f9']
        }
      },
      axisLabel: {
        color: '#2D3436'
      }
    },
    series: [
      {
        name: '数量',
        type: 'bar',
        data: barData,
        label: {
          show: true,
          position: 'top',
          formatter: '{c}',
          color: '#2D3436'
        },
        barWidth: '40%',
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(220, 220, 220, 0.1)'
        },
        itemStyle: {
          borderRadius: [5, 5, 0, 0]
        }
      }
    ]
  } as EChartsOption;
};

// 柱状图配置
const barOption = ref<EChartsOption>(getBarOption());

// 响应式处理
const sankeyChart = ref<ECharts | null>(null);
const pieChart = ref<ECharts | null>(null);
const barChart = ref<ECharts | null>(null);

// 图表就绪处理
const handleSankeyReady = (chart: ECharts) => {
  sankeyChart.value = chart;
};

const handlePieReady = (chart: ECharts) => {
  pieChart.value = chart;
};

const handleBarReady = (chart: ECharts) => {
  barChart.value = chart;
};

// 处理桑基图点击事件
const handleSankeyClick = (params: any) => {
  if (params.dataType === 'node') {
    const node = params.data;

    // 根节点：重置选择
    if (node.name === "Total") {
      resetSelection();
    }
    // 主分类节点：聚焦该分类
    else if (["Positive", "Negative", "Neutral", "Emergency"].includes(node.name)) {
      activeMainCategory.value = node.name;
    }
    // 子分类节点：聚焦其主分类
    else {
      activeMainCategory.value = node.name.split('_')[0];
    }
  }
};

// 处理饼图点击事件
const handlePieClick = (params: any) => {
  if (params.componentType === 'series' && params.componentSubType === 'pie') {
    activeMainCategory.value = params.name;
  }
};

// 重置选择
const resetSelection = () => {
  activeMainCategory.value = null;
};

// 监听主分类变化，更新柱状图
watch(activeMainCategory, () => {
  barOption.value = getBarOption();

  // 强制更新柱状图
  if (barChart.value) {
    barChart.value.setOption(barOption.value, true);
  }
});

const handleResize = () => {
  sankeyChart.value?.resize();
  pieChart.value?.resize();
  barChart.value?.resize();
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  sankeyChart.value?.dispose();
  pieChart.value?.dispose();
  barChart.value?.dispose();
});
</script>

<style scoped>
:root {
  --bg-primary: #f0f7ff;
  --bg-secondary: #dce6ff;
  --text-primary: #2D3436;
  --text-secondary: #636E72;
  --card-bg: rgba(255, 255, 255, 0.92);
}

.dashboard {
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  position: relative;
  overflow: hidden;

}

.dashboard::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 90% 10%, rgba(95, 93, 155, 0.05) 0%, transparent 25%),
    radial-gradient(circle at 10% 80%, rgba(95, 93, 155, 0.05) 0%, transparent 25%);
  pointer-events: none;
  z-index: 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px;
  background: var(--card-bg);
  border-radius: 15px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.08);
  margin-bottom: 20px;
  position: relative;
  z-index: 2;
  backdrop-filter: blur(4px);
}

.dashboard-title h1 {
  color: var(--text-primary);
  font-size: 1.8rem;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.dashboard-title p {
  color: var(--text-secondary);
  font-size: 1rem;
}

.controls {
  display: flex;
  gap: 15px;
}

.theme-toggle {
  background: #5F5D9B;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  background: #4a4880;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(95, 93, 155, 0.3);
}

.main-content {
  display: flex;
  gap: 20px;
  position: relative;
  z-index: 1;
  height: calc(100vh - 160px);
}

.sankey-container {
  flex: 2;
  background: var(--card-bg);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(4px);
}

.chart-header {
  margin-bottom: 15px;
  position: relative;
}

.chart-header h2 {
  font-size: 1.4rem;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 10px;
}

.chart-header p {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.interactive-info {
  display: flex;
  align-items: center;
  gap: 10px;
  /* background: rgba(95, 93, 155, 0.1); */
  padding: 8px 15px;
  border-radius: 20px;
  margin-top: 8px;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.reset-btn {
  background: none;
  border: none;
  padding: 4px 10px;
  font-size: 0.85rem;
  color: #636E72;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.3s;
}

.reset-btn:hover {
  color: #FF0000;
}

.sankey-container .chart {
  flex: 1;
  width: 100%;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pie-container, .bar-container {
  flex: 1;
  background: var(--card-bg);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(4px);
}

.pie-container .chart, .bar-container .chart {
  flex: 1;
  width: 100%;
}

@media (max-width: 992px) {
  .main-content {
    flex-direction: column;
    height: auto;
  }

  .sankey-container {
    height: 550px;
  }

  .right-panel {
    flex-direction: row;
    height: 500px;
  }

  .pie-container, .bar-container {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .right-panel {
    flex-direction: column;
    height: auto;
  }

  .pie-container, .bar-container {
    height: 350px;
  }

  .sankey-container {
    height: 450px;
  }
}
</style>
