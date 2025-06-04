<template>
  <footer class="app-footer">
    <div class="team-section">
      <h3>团队成员</h3>
      <ul>
        <li v-for="(member, index) in teamMembers" :key="index">
          {{ member.name }} - {{ member.role }}
        </li>
      </ul>
    </div>

    <div class="links-section">
      <h3>数据来源</h3>
      <ul>
        <li v-for="(link, index) in friendlyLinks" :key="index">
          <a :href="link.url" target="_blank">{{ link.name }}</a>
        </li>
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
      { name: '张健豪', role: '页面设计，封面设计，词频统计分析，侧边栏' },
      { name: '陈文涛', role: '舆论情感分析' },
      { name: '张焰鑫', role: '桑基图' },
      { name: '赵元见', role: '相关热点分析' }
    ];

    const friendlyLinks = [
      { name: 'Kaggle', url: 'https://www.kaggle.com/' },
      { name: '中国地震台网', url: 'https://news.ceic.ac.cn/index.html?random=0.44436846374918615' },
      { name: '国家地震科学数据中心', url: 'https://data.earthquake.cn/index.html' }
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
</style>
