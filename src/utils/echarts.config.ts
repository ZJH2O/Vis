import * as echarts from 'echarts/core';
import {
  TooltipComponent,
  VisualMapComponent,
  GeoComponent,
  LegendComponent,
  TitleComponent
} from 'echarts/components';
import {
  MapChart,
  LineChart,
  ScatterChart,
  LinesChart,
  HeatmapChart
} from 'echarts/charts';
import {
  CanvasRenderer,
  SVGRenderer
} from 'echarts/renderers';
// 集中注册所有需要的模块
export const useECharts = () => {
  echarts.use([
    TooltipComponent,
    VisualMapComponent,
    GeoComponent,
    LegendComponent,
    TitleComponent,
    MapChart,
    LineChart,
    ScatterChart,
    LinesChart,
    CanvasRenderer,
    SVGRenderer,
    HeatmapChart
  ]);
};
