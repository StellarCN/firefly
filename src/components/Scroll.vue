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
        
      }
    },
    computed: {
      pullconfig() {
          return {
            startLabel: this.$t(this.startLabelTxt),
            loadingLabel: this.$t(this.loadingLabelTxt),
            readyLabel: this.$t(this.readLabelTxt),
            errorLabel: this.$t(this.errorLabelTxt),
            pullDownHeight: this.$t(this.minHeight),
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
      startLabelTxt: {
        type: String,
        default: 'ReleaseToRefresh'
      },
      loadingLabelTxt: {
        type: String,
        default: 'Loading'
      },
      readLabelTxt: {
        type: String,
        default: 'ReleaseToRefresh'
      },
      errorLabelTxt: {
        type: String,
        default: 'LoadFail'
      },
      minHeight :{
        type: Number,
        default: 60
      }

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
