<template>
  <div class="page" dark>
    <toolbar :title="$t(title)"
             :showmenuicon="showmenuicon"
             :showbackicon="showbackicon"
             style="z-index:999;"
    >
    </toolbar>
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
  import Toolbar from '@/components/Toolbar'
  import HistoryOffer from '@/components/HistoryOffer'
  import HistoryTransaction from '@/components/HistoryTransaction'
  import HistoryTrade from '@/components/HistoryTrade'
  import HistoryDepositAndWithdraw from '@/components/HistoryDepositAndWithdraw'

  export default {
    data() {
      return {
        title: 'History.Title',
        showbackicon: false,
        showmenuicon: true,
        loading: false,
        show: {
          name: 'offer',
          component: HistoryOffer
        },
        components: {
          offer: HistoryOffer,
          transaction: HistoryTransaction,
          trade: HistoryTrade,
          depositAndWithdraw: HistoryDepositAndWithdraw
        }

      }
    },
    methods: {
      change() {
        this.home = HistoryOffer
      },
      switchComponent(name) {
        if (name == this.show.name) return
        this.show.name = name
        this.show.component = this.components[name]
        console.log(this.show)
      },


    },
    components: {
      Toolbar
    }

  }
</script>
<style lang="stylus" scoped>
  @require '../stylus/color.styl'
  .page
    background: $primarycolor.gray
    color: $primarycolor.font
    .content
      padding: 10px 10px
    .menu-wrapper
      background: $primarycolor.green
      height: 56px
      line-height: 56px
      margin-top: -1px
      .menu-ul
        width: 100%
        display: flex;
        justify-content: center;
        .menu-li
          float: left
          color: $primarycolor.font
          padding-left: 10px
          padding-right: 10px
          height: 55px
          line-height: 55px
          width: 42%
          text-align: center
        .menu-li.active
          border-bottom: 2px solid $primarycolor.font


</style>
