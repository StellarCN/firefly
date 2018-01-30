<template>
<v-card class="menu-card">
  <v-bottom-nav :value="true" :active="active" color="primary">
      <v-btn flat v-for="(item,index) in menus" :key="index" :value="index" @click="redirect(index,item.name)"> 
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
                { title:'Menu.MyAssets', name: 'MyAssets', path: '/assets', icon: 'account_balance_wallet' },
                { title:'Menu.TradeCenter', name: 'TradeCenter', path: '/trade', icon: 'trending_up' },
                { title:'Menu.Funding', name: 'Funding', path: '/funding', icon: 'import_export' },
                { title:'Menu.My', name: 'My', path: '/mysettings', icon: 'account_box' },
            ],
            active: -1
        }
    },
    watch: {
      $route(to,from){
          let path = to.path
          let index = -1
          for(var i=0,n=this.menus.length; i<n; i++){
              if(path.indexOf(this.menus[i].path) === 0){
                  index = i
                  break
              }
          }
          this.active = index
      }  
    },
    methods: {
        redirect(index,name){
            this.active = index
            console.log({name})
            this.$router.push({name})
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
