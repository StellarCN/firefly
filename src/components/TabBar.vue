<template>
<!-- <v-card class="menu-card"> -->
  <div class="tabbar-wrapper">
    <v-bottom-nav :value="true" :active.sync="active" color="dark" class="tb-menu" app fixed>
        <v-btn flat v-for="(item,index) in menus" :key="index" :value="index" @click="redirect(index,item.name)"> 
          <span>{{$t(item.title)}}</span>
          <v-icon>{{item.icon}}</v-icon>
          <div  v-if="index!==active && index===3 && unReadCount !==0 "  class="unread-wrapper"></div>
        </v-btn>
    </v-bottom-nav>
    <!-- <div class="bottom-safe-area"></div> -->
  </div>
<!-- </v-card> -->
</template>

<script>
  import {mapGetters} from  "vuex"
export default {
  data() {
    return {
      menus: [
        {
          title: "Menu.MyAssets",
          name: "MyAssets",
          path: "/assets",
          icon: "account_balance_wallet"
        },
        {
          title: "Menu.TradeCenter",
          name: "TradeCenter",
          path: "/trade",
          icon: "trending_up"
        },
        {
          title: "Title.ThirdApp",
          name: "Apps",
          path: "/apps/all",
          icon: "apps"
        },
        // {
        //   title: "Menu.Funding",
        //   name: "Funding",
        //   path: "/funding",
        //   icon: "import_export"
        // },
        {
          title: "Menu.My",
          name: "My",
          path: "/mysettings",
          icon: "account_circle"
        }
      ],
      active: -1
    };
  },
  
  watch: {
    '$route'(to,from){
      let names = this.menus.map(item=> item.name)
      let i = names.indexOf(to.name)
      if(i >= 0){
        this.active = i
      }
    }    
  },
  beforeMount() {
    let name = this.$route.name;
    let index = -1;
    for (var i = 0, n = this.menus.length; i < n; i++) {
      if (name === this.menus[i].name) {
        index = i;
        break;
      }
    }
    this.active = index;
  },
  methods: {
    redirect(index, name) {
      this.active = index;
      console.log({ name });
      this.$router.push({ name });
    }
  },
  computed:{
    ...mapGetters([
      'unReadCount'
    ])
  }
};
</script>

<style lang="stylus" scoped>
@require('~@/stylus/color.styl')
.menu-card.card
    height: 60px;
    position: fixed;
    border-radius: 0px;
    z-index: 99;
.tb-menu
  background: $secondarycolor.gray
  box-shadow: 0px -2px 2px $primarycolor.gray
  bottom: constant(safe-area-inset-bottom)!important
  bottom: env(safe-area-inset-bottom)!important
  &.bottom-nav.bottom-nav--active.dark
    .btn.btn--flat.btn--active
      color: $primarycolor.green

.bottom-nav .btn
  opacity inherit!important
  color #999
.bottom-nav .btn:not(.btn--active)
  filter inherit!important
.unread-wrapper
  width: 10px
  height: 10px
  border-radius: 5px
  background: $primarycolor.red 
  right: 20px
  top:5px
  position: absolute
  z-index: 10
.bottom-safe-area
  position: fixed
  bottom: 0
  left: 0
  right: 0
  height: 0
  height:  constant(safe-area-inset-bottom)
  height:  env(safe-area-inset-bottom)
  background: $secondarycolor.gray!important
  z-index: 999
.tabbar-wrapper
  background: $secondarycolor.gray!important
</style>
