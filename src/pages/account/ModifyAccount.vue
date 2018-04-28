<template>
  <div class="page">
    <toolbar :title="$t(title)" 
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      @goback="back"
      />

    <div class="content">
      <card class="mycard" padding="20px 10px 20px 10px">

        <div class="card-content" slot="card-content">
          <v-text-field
              name="name"
              :label="$t('Account.AccountName')"
              v-model="name"
              class="white-input"
              required
            ></v-text-field>  
          <v-text-field
              name="federation"
              :label="$t('FederationAddress')"
              v-model="federation"
              class="white-input"
            ></v-text-field>  
          <v-text-field
              name="inflation"
              :label="$t('InflationAddress')"
              v-model="inflation"
              class="white-input"
              multi-line
              rows=2
            ></v-text-field>  
          <div class="hintinfo">
            <div class="inflation">{{$t('InflationDesc')}}</div>
            <div class="inflation">
              <span class="suggest" @click.stop="choseInflation('xlmpool.com')">xlmpool.com<i class="material-icons">link</i></span>
              <span>{{$t('Account.SuggestInflationPool')}}</span>
            </div>
          </div>
        </div>
        
      </card>
      <div class="btn-group">
         <v-btn class="primary btn-save" primary @click.stop="save">{{$t('Save')}}</v-btn>
      </div>

    </div>
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import { mapState, mapActions} from 'vuex'
import Card from '@/components/Card'
import { INFLATION_POOL } from '@/api/gateways'
import { setOptions } from '@/api/operations'
import  defaultsDeep  from 'lodash/defaultsDeep'
export default {
  data(){
    return {
      title: 'Account.Modify',
      showbackicon: true,
      showmenuicon: false,
      name: null,
      address: null,
      seed: null,
      federation: null,
      inflation: null,

      workindex: null,
      workaccount:null,

      needUpdateOpt: false,//是否要修改Options

    }
  },
  computed:{
    ...mapState({
      accounts: state => state.accounts.data,
      account: state => state.accounts.selectedAccount,
      selected: state => state.accounts.selected,
      password: state => state.accounts.password
    }),
  },
  beforeMount(){
      let address = this.$route.query.address || account.address
      this.seed = this.$route.query.seed
      // console.log("--------------"+this.seed)
      for(var i=0,n=this.accounts.length;i<n;i++){
        if(this.accounts[i].address === address){
          this.workindex = i
          let showaccount = defaultsDeep({},this.accounts[i])
          this.workaccount = showaccount
          this.name  = showaccount.name
          this.address = showaccount.address
          this.federation = showaccount.federationAddress
          this.inflation = showaccount.inflationAddress
          break
        }
      }
  },
  mounted(){
  },
  methods: {
    ...mapActions({
      deleteAccount:'deleteAccount',
      cleanAccount: 'cleanAccount',
      updateAccount: 'updateAccount',
    }),
    back(){
      this.$router.back()
    },
    qrcodecallback(img){
      this.qrcodebase64 = img
    },
    save(){
      //if(!this.password)return
      let data = Object.assign({}, this.workaccount, {name: this.name,
      address: this.address,
      federationAddress: this.federation,
      inflationAddress: this.inflation})

      if(this.workaccount.federationAddress != this.federation || this.inflationAddress!=this.inflation){
        this.needUpdateOpt = true
      }
      console.log(this.workaccount)
      console.log(data)
      let params = {index: this.workindex, account: data}
      this.updateAccount(params)
        .then((data)=>{
          try{
            if(this.needUpdateOpt){
              this.saveInflationAndFed()
            }
            this.$toasted.show(this.$t('SaveSuccess'))
          }catch(err){
            console.error(err)
            this.$toasted.error(this.$t('SaveFailed'))
          }
        })
        .catch(err=>{
          console.error(err)
          this.$toasted.error(this.$t('SaveFailed'))
        })
      

    },
    saveInflationAndFed(){
      //保存通胀  联邦地址
      let values = {}
      let hasdata = false
      if(this.inflation){
        hasdata = true
        values.inflationDest = this.inflation
      }
      if(this.federation){
        hasdata = true
        values.homeDomain = this.federation
      }
      console.log(`save inflation and fed `)
      console.log(values)
      setOptions(this.seed,values).then(data=>{
        console.log(data)
        console.log('save inflation and fed success')
      })
      .catch(err=>{
        throw err
      })
    },
    choseInflation(host){
      console.log(INFLATION_POOL)
      console.log(host)
      for(var i=0,n=INFLATION_POOL.length;i<n;i++){
        if(INFLATION_POOL[i].host === host){
          this.inflation = INFLATION_POOL[i].address
          break
        }
      }
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
.hintinfo
  color: $secondarycolor.font
  margin-top: -20px
  .inflation
    .suggest
      color: $primarycolor.green


.btn-group
  width: 100%
  margin-top: 10px
  .btn-save
    width: 100%
    margin: 0px 0px
    padding: 0px 0px
    height: 36px

</style>

