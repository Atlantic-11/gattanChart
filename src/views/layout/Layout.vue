<template>
  <div id="layout">
    <div id="nav">
      <router-link to="/Home">Home</router-link> |
      <router-link to="/ganChart">ganChart</router-link>
  </div>
  <div id="main-container">
    <router-view/>
  </div>
  </div>
</template>

<script>
import Mainbottom from './main_bottom'
export default {
  components: {
    Mainbottom
  },
  methods: {
    async getLists() {
      const res = await this.$api.getLists()
      this.list = res.data
    },
    async getDetails() {
      const res = await this.$api.getDetails()
      this.details = res.data
    }
  }
}
</script>

<style>

</style>