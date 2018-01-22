/**
 * 
 */
<template>
  <div class="page">
    <toolbar :title="$t(title)" 
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      />
    <div class="content">
      <card padding="10px 10px" class="mycard">
        <div class="card-content" slot="card-content">
          <ul class="settings-ul">
            <li class="settings-li" @click="toManageAccount">
              <span>{{$t('ManageAccount')}}</span>
            </li>
            <li class="settings-li">
              <span>{{$t('PinCode')}}</span>
              <v-switch class="pincodeswitch"
                        v-model="pinEnable"
                        color="primary"
                        hide-details
                        @change="switchPinCode"
                        ></v-switch>
              
            </li>
            <li class="settings-li" @click="toChangeLanguage">
              <span>{{$t('Language')}}</span>
            </li>
            <li class="settings-li" @click="toChangeHorizon">
              <span>{{$t('PublicNetUrl')}}</span>
            </li>
            <li class="settings-li" @click="toAbout">
              <span>{{$t('About.Title')}}</span> 
            </li>
          </ul>
        </div>
      </card>
    </div>

  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import { mapState, mapActions} from 'vuex'
export default {
  data(){
    return {
      title: 'Menu.Settings',
      showbackicon: false,
      showmenuicon: true,
      pinEnable: false,
    }
  },
  computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      app: state => state.app
    }),
  
  },
  beforeMount(){
    this.pinEnable = this.app.enablePin || false
  },
  beforeUpdate(){
    this.pinEnable = this.app.enablePin || false
  },
  mounted(){
  },
  methods: {
    ...mapActions({
    }),
    switchPinCode(val){
      //value=true，跳转到设置ping界面
      if(val){
        this.$router.push(`/setpincode`)
        return
      }
      // value=false，则要求输入ping码，正确后才可以取消
      this.$router.push(`/delpincode`)
      
    },
    toManageAccount(){
      this.$router.push(`/account/manage`)
    },
    toChangeLanguage(){
      this.$router.push(`/language`)
    },
    toChangeHorizon(){
      this.$router.push(`/horizon`)
    },
    toAbout(){
      this.$router.push(`/about`)
    },
   
  },
  components: {
    Toolbar,
    Card,
  }
}
</script>


<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
.page
  background: $primarycolor.gray
  color: $primarycolor.font
  font-size: 16px
  //  position: absolute
  // top: 0
  //bottom:0
  //left:0
  //right: 0
  .content
    padding: 10px 10px
    .mycard
      .card-content
        .settings-ul
          padding-left: 10px
          .settings-li
            font-size: 16px
            padding-top: 5px
            padding-bottom: 5px
            .pincodeswitch
              float: right
              width: 50px
              padding-top: 0px

</style>

