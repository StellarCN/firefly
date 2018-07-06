/**
 * horizon连接调整
 */
<template>
  <div class="page">
    <toolbar :title="$t(title)" 
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      @goback="back"
      />
    <div class="content">
      <card padding="10px 10px" class="mycard">
        <div class="card-content" slot="card-content">
          <v-text-field
              name="horizon"
              :label="$t('PublicNetUrl')"
              v-model="horizon"
              dark
            ></v-text-field>

            <v-container fluid grid-list-md>
            <v-layout row wrap>
              <v-flex d-flex xs12 sm6 md3 @click="changeHorizon(fchain)">
                  <v-flex d-flex xs11>
                    <v-layout row wrap>
                      <v-flex d-flex xs12 class='label'>{{$t('fchainHorizon')}}</v-flex>
                      <v-flex d-flex xs12 class="value">{{fchain}}</v-flex>
                    </v-layout>
                  </v-flex>
                  <v-flex xs1 class='select'>
                    <i class="iconfont horizon icon-dot1" v-if="horizon === fchain"></i>
                    <i class="iconfont horizon icon-dot" v-else></i>
                  </v-flex>
              </v-flex>
               <v-flex class="tag-wrapper" xs12 v-if="horizon_version_fchain!=null">
                <span :class="{horizon_timeusestyle:true, horizon_timeusebgcone:timeUse_fchain<=50,horizon_timeusebgctwo:timeUse_fchain<=100&&timeUse_fchain>50,horizon_timeusebgcthree:timeUse_fchain<=150&&timeUse_fchain>100,horizon_timeusebgcfour:timeUse_fchain<=200&&timeUse_fchain>150,horizon_timeusebgcfive:timeUse_fchain>=200}">{{timeUse_fchain}}ms</span>
                <span class="horizon_msgstyle">{{$t('HorizonVersion')}}:{{horizon_version_fchain}}</span>
              </v-flex>

              <v-flex d-flex xs12 sm6 md3 @click="changeHorizon(stellar)">
                  <v-flex d-flex xs11>
                    <v-layout row wrap>
                      <v-flex d-flex xs12 class='label'>{{$t('StellarOrg')}}</v-flex>
                      <v-flex d-flex xs12 class="value">{{stellar}}</v-flex>
                    </v-layout>
                  </v-flex>
                  <v-flex xs1 class='select'>
                    <i class="iconfont horizon icon-dot1" v-if="horizon === stellar"></i>
                    <i class="iconfont horizon icon-dot" v-else></i>
                  </v-flex>
              </v-flex>
              <v-flex class="tag-wrapper" xs12 v-if="this.horizon_version_stellar!=null">
                <span :class="{horizon_timeusestyle:true, horizon_timeusebgcone:timeUse_stellar<=50,horizon_timeusebgctwo:timeUse_stellar<=100&&timeUse_stellar>50,horizon_timeusebgcthree:timeUse_stellar<=150&&timeUse_stellar>100,horizon_timeusebgcfour:timeUse_stellar<=200&&timeUse_stellar>150,horizon_timeusebgcfive:timeUse_stellar>=200}">{{timeUse_stellar}}ms</span>
                <span class="horizon_msgstyle">{{$t('HorizonVersion')}}:{{horizon_version_stellar}}</span>
              </v-flex>
               <v-flex d-flex xs12 sm6 md3  @click="changeHorizon(chinapublic)" >
                  <v-flex d-flex xs11>
                    <v-layout row wrap>
                      <v-flex d-flex xs12 class='label'>{{$t('ChinaPublic')}}</v-flex>
                      <v-flex d-flex xs12 class='value'>{{chinapublic}}</v-flex>
                    </v-layout>
                  </v-flex>
                  <v-flex xs1 class="select">
                    <i class="iconfont horizon icon-dot1" v-if="horizon === chinapublic"></i>
                    <i class="iconfont horizon icon-dot" v-else></i>
                  </v-flex>
              </v-flex>
              
              <v-flex class="tag-wrapper" xs12 v-if="this.horizon_version_chinapublic!=null">
                <span :class="{horizon_timeusestyle:true, 
                    horizon_timeusebgcone:timeUse_chinapublic<=50,
                    horizon_timeusebgctwo:timeUse_chinapublic<=100&&timeUse_chinapublic>50,
                    horizon_timeusebgcthree:timeUse_chinapublic<=150&&timeUse_chinapublic>100,
                    horizon_timeusebgcfour:timeUse_chinapublic<=200&&timeUse_chinapublic>150,
                    horizon_timeusebgcfive:timeUse_chinapublic>=200}">{{timeUse_chinapublic}}ms</span>
                <span class="horizon_msgstyle">{{$t('HorizonVersion')}}:{{horizon_version_chinapublic}}</span>
              </v-flex>

              <!--
              <v-flex d-flex xs12 sm6 md3 @click="changeHorizon(wancloud)">
                  <v-flex d-flex xs11>
                    <v-layout row wrap>
                      <v-flex d-flex xs12 class='label'>{{$t('WanCloud')}}</v-flex>
                      <v-flex d-flex xs12 class='value'>{{wancloud}}</v-flex>
                    </v-layout>
                  </v-flex>
                  <v-flex xs1 class="select">
                    <i class="iconfont icon-dot1" v-if="horizon === wancloud"></i>
                    <i class="iconfont icon-dot" v-else></i>
                  </v-flex>
              </v-flex>
              <v-flex xs12 v-if="this.horizon_version_wancloud!=null">
                <v-flex xs12>
                  <v-layout row wrap>
                      <v-flex xs3 :class="{horizon_timeusestyle:true, horizon_timeusebgcone:timeUse_wancloud<=50,horizon_timeusebgctwo:timeUse_wancloud<=100&&timeUse_wancloud>50,horizon_timeusebgcthree:timeUse_wancloud<=150&&timeUse_wancloud>100,horizon_timeusebgcfour:timeUse_wancloud<=200&&timeUse_wancloud>150,horizon_timeusebgcfive:timeUse_wancloud>=200}">{{$t("Pin")}}:{{timeUse_wancloud}}</v-flex>
                      <v-flex xs5 class="horizon_msgstyle">{{horizon_version_wancloud}}</v-flex>
                  </v-layout>
                </v-flex>
              </v-flex> -->
            </v-layout>
          </v-container>
        </div> 
      </card>
      <div class="btn-group btns">
        <v-btn class="btn-save" color="error" @click="save">{{$t('Save')}}</v-btn>
      </div>
    </div>

  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import { mapState, mapActions} from 'vuex'
import { OFFICIAL_HORIZON,CHINA_HORIZON,WANCLOUD_HORIZON,FCHAIN_HORIZON } from '@/api/horizon'
 
import { getAddressPinInfo } from '@/api/gateways'
import * as accountapi from '@/api/account'
export default {
  data(){
    return {
      title: 'PublicNetUrl',
      showbackicon: true,
      showmenuicon: false,
      horizon:null,
      working: false,
      horizon_version:[],
      horizon_version_stellar:null,
      horizon_version_chinapublic:null,
      horizon_version_wancloud:null,
      horizon_version_fchain: null,
      timeUse_fchain: null,
      timeUse_stellar:null,
      timeUse_chinapublic:null,
      timeUse_wancloud:null,
    }
  },
  computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      app: state => state.app
    }),
    stellar(){
      return OFFICIAL_HORIZON
    },
    chinapublic(){
      return CHINA_HORIZON
    },
    wancloud(){
      return WANCLOUD_HORIZON
    },
    fchain(){
      return FCHAIN_HORIZON
    }
  
  },
  beforeMount(){
    this.horizon = this.app.horizon
    this.changeHorizon(this.horizon)
  },
  mounted(){
    this.timeUseBySelectHorizon()
  },
  methods: {
    ...mapActions({
      setHorizon: 'setHorizon'
    }),
    back(){
      this.$router.back()
    },
    timeUseBySelectHorizon(){
      let startTime = new Date().getTime()
      console.log(startTime)
      const promise_stellar = getAddressPinInfo(this.stellar);
      const promise_chinapublic = getAddressPinInfo(this.chinapublic);
      // const promise_wancloud = getAddressPinInfo(this.wancloud);
      const promise_fchain = getAddressPinInfo(this.fchain)
      promise_stellar.then(response=>{
        this.horizon_version_stellar=(response.data.horizon_version)
        let endTime = new Date().getTime()
        console.log(endTime+"==1")
        this.timeUse_stellar=((Number(endTime)-Number(startTime)))
        startTime = new Date().getTime()
        console.log(startTime+"--1")
      })
      promise_chinapublic.then(response=>{
        this.horizon_version_chinapublic=(response.data.horizon_version)
        let endTime = new Date().getTime()
        console.log(endTime+"==2")
        this.timeUse_chinapublic =((Number(endTime)-Number(startTime)))
        startTime = new Date().getTime()
        console.log(startTime+"--2")
      })
      promise_fchain.then(response=>{
        this.horizon_version_fchain=(response.data.horizon_version)
        let endTime = new Date().getTime()
        console.log(endTime+"==2")
        this.timeUse_fchain =((Number(endTime)-Number(startTime)))
        startTime = new Date().getTime()
        console.log(startTime+"--2")
      })
      // promise_wancloud.then(response=>{
      //   this.horizon_version_wancloud = (response.data.horizon_version)
      //   let endTime = new Date().getTime()
      //   console.log(endTime+"==3")
      //   this.timeUse_wancloud =((Number(endTime)-Number(startTime)))
      //   startTime = new Date().getTime()
      //   console.log(startTime+"--3")
      // })
    },
    changeHorizon(url){
      this.horizon = url
    },
    save(){
      if(this.working)return
      this.working = true
      this.setHorizon(this.horizon)
        .then(()=>{
          this.$toasted.show(this.$t('SaveHorizonSuccess'))
          setTimeout(()=>{
            this.working = false
            this.$router.back()
          },1000)
        })
        .catch(err=>{
          this.working = false
          this.$toasted.error(this.$t('Error.SaveHorizonFail'))
        })
    }
   
  },
  components: {
    Toolbar,
    Card,
  }
}
</script>


<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
.select
  display flex
  justify-content center
  align-items center
  color: $primarycolor.green
  .iconfont
    font-size: .7rem
.page
  background: $primarycolor.gray
  color: $primarycolor.font
  font-size: 16px
  .content
    padding: 10px 10px
    .mycard
      .card-content
        .label
          color: $secondarycolor.font
          padding-top: 10px
          padding-bottom: 1px
        .value
          font-size: 18px
    .btn-group
      margin-top: 20px
      width: 100%
      .btn-save
        padding: 0px 0px
        margin: 0px 0px
        width: 100%
        height: 36px

.horizon_pinstyle
  background:$primarycolor.green
  border-radius:5px
  text-align:center
.horizon_timeusestyle
  text-align:center
  font-size:10px
  margin-right:10px
.horizon_timeusebgcone
  background:green
.horizon_timeusebgctwo
  background:#5cb85c
.horizon_timeusebgcthree
  background:#5bc0de
.horizon_timeusebgcfour
  background:#f0ad4e
.horizon_timeusebgcfive
  background:#d9534f

.horizon_msgstyle
  background:$primarycolor.red
  text-align:center
  font-size:10px
.tag-wrapper
  padding: 0px 2px 0px 8px!important
  span
    padding: 2px 4px
.btns
  position: absolute
  left: 0
  right: 0
  bottom: .2rem
  bottom:  calc(.2rem + constant(safe-area-inset-bottom))
  bottom:  calc(.2rem + env(safe-area-inset-bottom))
  padding: .1rem .2rem
//颜色分类
  // brand-primary: darken(#428bca, 6.5%); // #337ab7
  // @brand-success: #5cb85c;
  // @brand-info:    #5bc0de;
  // @brand-warning: #f0ad4e;
  // @brand-danger:  #d9534f;

//   @gray-darker:  lighten(#000, 13.5%); // #222
// @gray-dark:    lighten(#000, 20%);   // #333
// @gray:         lighten(#000, 33.5%); // #555
// @gray-light:   lighten(#000, 46.7%); // #777
// @gray-lighter: lighten(#000, 93.5%); // #eee
</style>

