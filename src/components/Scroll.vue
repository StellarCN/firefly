<template>
  <vue-pull-refresh :on-refresh="refresh" :config="pullconfig">
    <slot></slot>  
  </vue-pull-refresh>  

</template>

<script>

import VuePullRefresh  from 'vue-pull-refresh'

  export default {
    data(){
      return {
        pullconfig: {
          startLabel: this.$t('ReleaseToRefresh'),
          loadingLabel: this.$t('Loading'),
          readyLabel: this.$t('ReleaseToRefresh'),
          errorLabel: this.$t('LoadFail'),
          pullDownHeight: 60,
        }
      }
    },
    props: {
      /**
       * 是否派发滚动到底部的事件，用于上拉加载
       */
      refresh: {
        type: Function,
        required: true
      },
    },
    mounted() {
    },
    methods: {
      onRefresh() {
        return this.refresh()
      },
     
    },
    components: {
      'vue-pull-refresh': VuePullRefresh
    }
  }
</script>

<style lang="stylus" scoped>

</style>
