<template>
  <div>
    <tool-bar :title="$t(title)"
              :showmenuicon="false"
              :showbackicon="true"
              @goback="back">
      <v-btn icon slot="right-tool" @click="readAll">
        <i class="material-icons">done_all</i>
      </v-btn>
      

    </tool-bar>
      <ul class="content">
        <li v-for="(item ,index) in messages" class="item" @click="goToDetils(item)" :key="index">
          <div class="item-title"> 
            {{item.title }}
          </div>
          <div class="item-time">
             {{ item.date }}
          </div>
          <span class="circular" v-if="reads.indexOf(item.link) > -1 "></span>
        </li>
      </ul>
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
          }
      },
      components:{
        ToolBar,
        Scroll
      },
      methods:{
        ...mapActions([
          "getMessages",
          "selectMsg",
          "readAllMsg"
        ]),
        back(){
          this.$router.back();
        },
        goToDetils(item){
          this.selectMsg(item)
          this.$router.push({name: 'MessageDetils'})
        },
        readAll(){
          this.readAllMsg()
          this.$toasted.show(this.$t('ReadAllMsg'))
        }, 
        
        
      },
      computed:{
        ...mapGetters([
              "unReadCount"
            ]),
        ...mapState({
          messages: state => state.message.items,
          reads: state => state.message.reads
        }),
      }
    }
</script>

<style lang="stylus" scoped>
  @require '~@/stylus/color.styl'
   .content
      .item
        padding: .2rem .2rem
        background #303034
        margin: .1rem auto
        .item-title
          line-height: 24px
          height: 24px
          font-size .45rem!important
          white-space: nowrap
          overflow hidden

        .item-time
          font-size: .35rem
          color: $secondarycolor.font
        .item-content
          flex 2
          height initial
          text-overflow ellipsis
          overflow hidden
          white-space nowrap
          padding-top 15px
        .circular
          position absolute
          width 8px
          height 8px
          background red
          border-radius 7.5px
          right 2px
          top 2px
</style>
