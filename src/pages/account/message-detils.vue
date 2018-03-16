<template>
  <div>
    <tool-bar :title="getCurrentItem.title"
              :showmenuicon="showmenuicon"
              :showbackicon="showbackicon"
              @goback="back"></tool-bar>
    <div class="message-detils">
      <h1 class=" message-title" >{{getCurrentItem.title}}</h1>
      <div class="message-content">
        {{getCurrentItem.content}}
      </div>
    </div>
  </div>
</template>

<script>
  import {mapState,mapActions,mapGetters} from "vuex"
  import ToolBar from "@/components/Toolbar"
    export default {
        name: "message-detils",
      data(){
          return{
            showbackicon: true,
            showmenuicon: false,
          }
      },
      methods:{
        back(){
          this.$router.back();
        }
      },
      components:{
          ToolBar
      },
      computed:{
        ...mapGetters([
          'getCurrentItem'
        ])
      }
    }
</script>

<style lang="stylus" scoped>
  .message-detils
    padding 10px
    .message-content
      word-wrap: break-word
</style>
