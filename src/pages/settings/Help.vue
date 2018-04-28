/**
 * 帮助界面
 */
<template>
  <div class="page">
    <toolbar :title="$t(title)" 
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      style="z-index:999;"
      >
    </toolbar>
      <v-container  :class="'content-container ' + (isios ? 'content-ios' : '')">
       <iframe ref="frameinstance" :src="location" id="frameinstance" style="height:100%;width:100%;overflow-y:auto;" frameborder="no" border="0" marginwidth="0" ></iframe>
      </v-container>
    
<!--
    <div id="helpcontent" class="content" ref="content">
      <iframe  ref="frameinstance" :src="location" id="frameinstance"  style="height:100%;width:100%;overflow-y:auto;" frameborder="no" border="0" marginwidth="0" marginheight="0"></iframe>
    </div>
-->
    <div class="loading-content"  v-if="loading">
      <v-progress-circular indeterminate color="primary" class="loadingicon"></v-progress-circular>
    </div>
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
// import axios from 'axios'
export default {
  data(){
    return {
      title: 'Menu.Help',
      showbackicon: true,
      showmenuicon: false,
      loading: false,
      instance: null,
      location: null,
      url:'https://wallet.fchain.io/manual'+'?'+Math.random(),
      isios: false
    }
  },
  created(){
    if('ios' === cordova.platformId){
      this.isios = true
    }
  },
  mounted(){
   this.loading = true
    let frame = document.getElementById("frameinstance");
    frame.onload = this.onload
    this.location = this.url

  },
  methods: {
    onload(){
      this.loading = false
    }

  },
  components: {
      Toolbar,
  }
  
}
</script>


<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
.page
  background: $primarycolor.gray
  height: 100%
  overflow-y: hidden
  .content
    width: 100%
    -webkit-overflow-scrolling:touch
    overflow:auto
.content-container
  position: fixed
  top: 48px
  bottom: 0px
  left: 0
  right: 0  
  padding: 0px 0px
.content-ios
  top: 70px
.loading-content
  position: fixed
  top: 0
  bottom:0
  left: 0
  right: 0
  z-index:99
  text-align: center
  background: $secondarycolor.gray
  opacity: 0.8
  .loadingicon
    margin-top: 50%
</style>

