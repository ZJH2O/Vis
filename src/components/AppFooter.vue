<template>
  <footer class="app-footer">
    <div class="team-section">
      <h3>团队分工</h3>
      <ul>
        <li v-for="(member, index) in teamMembers" :key="index">
          {{ member.name }} - {{ member.role }}
        </li>
        <li class="team-collab">全球地震分布与中国地震监测视图由团队全体成员共同完成</li>
      </ul>
    </div>

    <div class="links-section">
      <h3>数据来源</h3>
      <ul>
        <li v-for="(link, index) in friendlyLinks" :key="index">
          <a :href="link.url" target="_blank">{{ link.name }}</a>
        </li>
        <li class="team-collab">特殊说明:舆情分析部分的数据集来自2023年2月6日土耳其地震之后近5天的Twitter公开舆论数据</li>
      </ul>
    </div>

        <div class="respositories-section">
      <h3>代码仓库</h3>
      <ul>
        <li v-for="(link, index) in respositoryLink" :key="index">
          <a :href="link.url" target="_blank">{{ link.name }}</a>
        </li>
      </ul>
    </div>
  </footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AppFooter',
  setup() {
    const teamMembers = [
      { name: '张健豪', role: '数据收集与清洗，页面设计，词频统计分析' },
      { name: '陈文涛', role: '舆论情感分析' },
      { name: '张焰鑫', role: '桑基图分析' },
      { name: '赵元见', role: '相关热点分析' }
    ];

    const friendlyLinks = [
      { name: 'Kaggle', url: 'https://www.kaggle.com/datasets/esatakkasoglu/turkey-06-02-2023-eartquake-tweets' },
      { name: '中国地震台网', url: 'https://news.ceic.ac.cn/index.html?random=0.44436846374918615' },
      { name: '国家地震科学数据中心', url: 'https://data.earthquake.cn/index.html' },
      { name: 'Echarts地图数据', url: 'https://www.isqqw.com/viewer?id=49097'}
    ];

    const respositoryLink = [
      { name: 'GitHub', url: 'https://github.com/ZJH2O/Vis'}
    ];

    return { teamMembers, friendlyLinks, respositoryLink };
  }
});
</script>

<style scoped>
.app-footer {
  background-color: #faf5f5;
  padding: 2rem;
  text-align: center;
}

.team-section, .links-section {
  margin-bottom: 1.5rem;
}

ul {
  margin-top: 6px;
  list-style: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 15px;
}

a {
  color: #952e25;
  text-decoration: none;
}

a:hover {
  text-decoration: none;
  color: #dfbe16;
  background-color: #df601600;
}
.team-collab {
  display: block;
  margin-top: 6px;
  font-size: 13px;
}
</style>
