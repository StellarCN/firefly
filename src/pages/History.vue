<template>
  <div class="page" dark>
    <toolbar :title="$t(title)" :showbackicon="true" style="z-index:999;" @goback="back"/>
    
    <div class="menu-wrapper">
      <ul class="menu-ul">
        <li :class="'menu-li ' + (show.name=='offer'?'active':'')" @click="switchComponent('offer')">
          {{$t('History.Offer')}}
        </li>
        <li :class="'menu-li ' + (show.name=='transaction'?'active':'')" @click="switchComponent('transaction')">
          {{$t('History.Transaction')}}
        </li>
        <li :class="'menu-li ' + (show.name=='trade'?'active':'')" @click="switchComponent('trade')">
          {{$t('History.Trade')}}
        </li>
        <li :class="'menu-li ' + (show.name=='depositAndWithdraw'?'active':'')"
            @click="switchComponent('depositAndWithdraw')">{{$t('History.DepositAndWithdraw')}}
        </li>
      </ul>
    </div>

    <component v-bind:is="show.component"></component>
     
  </div>
</template>

<script>

  import {mapState, mapActions, mapGetters} from 'vuex'
  import Toolbar from '@/components/Toolbar'
  import HistoryOffer from '@/components/HistoryOffer'
  import HistoryTransaction from '@/components/HistoryTransaction'
  import HistoryTrade from '@/components/HistoryTrade'
  import HistoryDepositAndWithdraw from '@/components/HistoryDepositAndWithdraw'
  import Card from '@/components/Card'

  export default {
    data() {
      return {
        title: 'History.Title',
        loading: false,
        components: {
          offer: HistoryOffer,
          transaction: HistoryTransaction,
          trade: HistoryTrade,
          depositAndWithdraw: HistoryDepositAndWithdraw
        },
        show: {
          name: null,
          component: null
        }
      }
    },
    created() {
      this.switchComponent(this.currentHistoryComponent)
    },
    computed: {
     ...mapState({
       currentHistoryComponent: state => state.accounts.currentHistoryComponent,
     }),
    },
    methods: {
      ...mapActions([
        'changeCurrentHistoryComponent'
      ]),
      back(){
        this.$router.back()
      },
      switchComponent(name) {
        if (name == this.show.name) return
        this.show.name = name
        this.show.component = this.components[name]
      },
    },
    beforeDestroy() {
      this.changeCurrentHistoryComponent(this.show.name)
    },
    components: {
      Toolbar,
      Card
    }
  }
</script>
<style lang="stylus" scoped>
  @require '~@/stylus/color.styl'
    .menu-wrapper
      margin-top: 10px
      .menu-ul
        width: 100%
        display: flex;
        justify-content: center;
        .menu-li
          float: left
          color: $secondarycolor.font
          padding-left: 10px
          padding-right: 10px
          height: 32x
          line-height: 32px
          text-align: center
          font-size: 16px
        .menu-li.active
          border-bottom: 2px solid $primarycolor.green
          color: $primarycolor.green

</style>
