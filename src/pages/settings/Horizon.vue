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
              <v-flex d-flex xs12 sm6 md3 @click="changeHorizon(stellar)">
                  <v-flex d-flex xs11>
                    <v-layout row wrap>
                      <v-flex d-flex xs12 class='label'>{{$t('StellarOrg')}}</v-flex>
                      <v-flex d-flex xs12 class="value">{{stellar}}</v-flex>
                    </v-layout>
                  </v-flex>
                  <v-flex xs1 class='select'>
                    <i class="iconfont icon-dot1" v-if="horizon === stellar"></i>
                    <i class="iconfont icon-dot" v-else></i>
                  </v-flex>
              </v-flex>
              <v-flex d-flex xs12 sm6 md3  @click="changeHorizon(chinapublic)" >
                  <v-flex d-flex xs11>
                    <v-layout row wrap>
                      <v-flex d-flex xs12 class='label'>{{$t('ChinaPublic')}}</v-flex>
                      <v-flex d-flex xs12 class='value'>{{chinapublic}}</v-flex>
                    </v-layout>
                  </v-flex>
                  <v-flex xs1 class="select">
                    <i class="iconfont icon-dot1" v-if="horizon === chinapublic"></i>
                    <i class="iconfont icon-dot" v-else></i>
                  </v-flex>
              </v-flex>
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
            </v-layout>
          </v-container>
        </div> 
      </card>
      <div class="btn-group">
        <v-btn class="btn-save" primary @click="save">{{$t('Save')}}</v-btn>
      </div>
    </div>

  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import { mapState, mapActions} from 'vuex'
import { OFFICIAL_HORIZON,CHINA_HORIZON,WANCLOUD_HORIZON } from '@/api/horizon'
import { initStreams } from '@/streams'
export default {
  data(){
    return {
      title: 'PublicNetUrl',
      showbackicon: true,
      showmenuicon: false,
      horizon:null,
      working: false
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
    }
  
  },
  beforeMount(){
    this.horizon = this.app.horizon
  },
  mounted(){
  },
  methods: {
    ...mapActions({
      setHorizon: 'setHorizon'
    }),
    back(){
      this.$router.back()
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
          initStreams(this.account.address)
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


</style>

