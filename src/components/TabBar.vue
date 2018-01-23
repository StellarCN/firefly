<template>
<v-card class="menu-card">
  <v-bottom-nav :value="true" :active="active" color="primary">
      <v-btn flat v-for="(item,index) in menus" :key="index" :value="index" @click="redirect(index,item.path)"> 
        <span>{{$t(item.title)}}</span>
        <v-icon>{{item.icon}}</v-icon>
      </v-btn>
    </v-bottom-nav>
</v-card>
</template>

<script>
export default {
    data () {
        return {
            menus : [
                { title:'Menu.MyAssets', name: 'MyAsset', path: '/myassets', icon: 'account_balance_wallet' },
                { title:'Menu.TradeCenter', name: 'TradeCenter', path: '/tradecenter', icon: 'trending_up' },
                { title:'Menu.Funding', name: 'Funding', path: '/funding', icon: 'import_export' },
                { title:'Menu.My', name: 'My', path: '/my', icon: 'account_box' },
            ],
            active: 0
        }
    },

    methods: {
        redirect(index,url){
            this.active = index
            this.$router.push(url)
        },
    }
}
</script>

<style lang="stylus">
.menu-card.card
  height: 60px
  position: fixed
  border-radius: 0px
  z-index:99
</style>
