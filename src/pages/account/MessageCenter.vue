<template>
  <div>
    <tool-bar :title="$t(title)"
              :showmenuicon="showmenuicon"
              :showbackicon="showbackicon"
              @goback="back"></tool-bar>
    <scroll>
      <ul class="content">
        <li v-for="(item ,index) in messageItems" class="item" @click="goToDetils(item)">
          <p class="item-title"> <span class="title">{{item.title}}</span><span class="time">{{ new Date(Number.parseInt(item.createTime)).toLocaleString().replace("下午","")}}</span> </p>
          <p class="item-content">{{item.content}}</p>
          <span class="circular" v-if="item.status==0"></span>
        </li>
      </ul>
    </scroll>
  </div>
</template>

<script>
  import ToolBar from "@/components/Toolbar"
  import Scroll from "@/components/Scroll"
  import {mapActions,mapState ,mapGetters} from "vuex"
    export default {
        name: "message-center",
      data(){
          return{
            title: 'MessageCenter',
            showbackicon: true,
            showmenuicon: false,
          }
      },created(){
      },
      components:{
        ToolBar,
        Scroll
      },methods:{
        back(){
          this.$router.back();
        },
        goToDetils(item){
          this.$router.replace({path:`/account/message-detils/${item.id}`});
          this.changeCurrentItemId({id:item.id});
          this.changeStatus({item})
        },
        ...mapActions([
          "loadMessageItem",
          "changeCurrentItemId",
          "changeStatus"
        ])
      },computed:{
          ...mapGetters(
              [
                "messageItems"
              ]
          )
        }
    }
</script>

<style lang="stylus" scoped>
  @require '~@/stylus/color.styl'
   .content
      .item
        display flex
        background #303034
        height 2rem
        margin-bottom 10px
        flex-direction column
        padding-left 5px
        position relative
        .item-title
          flex 1
          justify-content space-between
          display flex
          padding-top 5px
          .time
            padding-right 3px
        .item-content
          flex 2
          height initial
          text-overflow ellipsis
          overflow hidden
          white-space nowrap
        .circular
          position absolute
          width 8px
          height 8px
          background red
          border-radius 7.5px
          right 2px
          top 2px
</style>
