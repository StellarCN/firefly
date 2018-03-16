<template>
<!-- <v-card class="menu-card"> -->
  <v-bottom-nav :value="true" absolute :active.sync="active" color="dark" class="tb-menu" app fixed absolute>
      <v-btn flat v-for="(item,index) in menus" :key="index" :value="index" @click="redirect(index,item.name)"> 
        <span>{{$t(item.title)}}</span>
        <v-icon>{{item.icon}}</v-icon>
        <div  v-if="index!==active && index===3 && unreadMessage.length !==0 "  style="width: 10px;height: 10px;border-radius: 5px;background: red;right: 20px;top:5px;position: absolute;z-index: 10"></div>
      </v-btn>
  </v-bottom-nav>
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
          title: "Menu.Funding",
          name: "Funding",
          path: "/funding",
          icon: "import_export"
        },
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
      'unreadMessage'
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
  &.bottom-nav.bottom-nav--active.dark
    .btn.btn--flat.btn--active
      color: $primarycolor.green
</style>
<style lang="stylus" scoped>
  .bottom-nav .btn
    opacity inherit!important
    color #999
  .bottom-nav .btn:not(.btn--active)
    filter inherit!important
</style>
