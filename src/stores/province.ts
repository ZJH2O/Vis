import {defineStore} from 'pinia';

export const useProvinceStore = defineStore('province', {
  state: () => ({
    selectedProvince: '全国'
  }),
  actions: {
      setSelectedProvince(province: string) {
        this.selectedProvince = province
      },
      resetProvince() {
        this.selectedProvince = '全国'
      }
  },
})
