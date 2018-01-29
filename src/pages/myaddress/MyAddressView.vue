/**
 * 
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
        <div class="card-content  myaddress-name grey--text text--lighten-1" slot="card-content">
              {{myaddress.name}}
        </div>
      </card>
      <v-subheader dark class="grey--text text--lighten-1">{{$t(detailLabel)}}</v-subheader>
      <card padding="10px" class="mycard">
        <div class="card-content myaddress-info grey--text text--lighten-1" slot="card-content">
          <v-subheader dark class='grey--text text--lighten-1'>{{$t(addressLabel)}}</v-subheader>
           <p @click="copy(myaddress.address)">   {{myaddress.address}}</p>
          <div v-if='myaddress.memo'>
            <v-subheader dark class='grey--text text--lighten-1'>{{$t(memoLabel)}}</v-subheader>
            <p>
              {{myaddress.memo}}
              </p>
          </div>
        </div>
      </card>
      

      <div class="btn-footer">         
        <v-btn class='btn-del error' :loading="working" block dark @click="del" >{{$t('Delete')}}</v-btn>
      </div>

    </div>
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import { mapState, mapActions} from 'vuex'
export default {
  data() {
    return {
      title: 'MyAddress.Title',
      detailLabel: 'ContactAdd.details',
      addressLabel: 'ContactAdd.address',
      memoLabel: 'ContactAdd.memo',
      showbackicon: true,
      showmenuicon: false,
      working: false,
      index:-1,
      myaddress:{}
    }
  },
  computed: {
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      myaddresses: state => state.app.myaddresses || []
    }),
  },
  mounted() {
    let data = this.selected()
    this.index = data.index
    this.myaddress = data.data || {}
  },
  methods: {
    ...mapActions(['deleteMyAddress']),
    back() {
      this.$router.back()
    },
    copy(value){
      if(cordova.plugins.clipboard){
        cordova.plugins.clipboard.copy(value)
        this.$toasted.show(this.$t('CopySuccess'))
      }
    }, 
    selected(){
      let name = this.$route.params.name
      console.log(this.$route)
      for(var i=0,n=this.myaddresses.length;i<n;i++){
        if(this.myaddresses[i].name === name){
          return {index:i, data: this.myaddresses[i]}
        }
      }
      return {}
    },
    del() {
     if(this.working)return
     this.working = true
     this.deleteMyAddress(this.myaddress)
      .then(data=>{
        this.$toasted.show(this.$t('MyAddress.DeleteSuccess'))
        this.$router.push({name: 'MyAddressList'})
      })
      .catch(err=>{
        console.error(err)
        this.$toasted.error(this.$t('MyAddress.DeleteFail'))
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
.page
  background: $primarycolor.gray
  color: $primarycolor.font
  font-size: 16px
  .content
    padding: 10px
    .mycard
      .myaddress-name
        min-width 100%
        display flex
        flex-direction column
        justify-content space-around
        align-items center
        text-align center
        min-height 50px
        font-size: 16px
        white-space: wrap
        word-break:break-all
        .avatar 
          font-size 16px
          color  #21ce90
      .myaddress-info 
          padding 0 6px
          font-size 14px
          font-weight lighter
          word-wrap wrap
          word-break break-all
          .subheader
            padding 0
            height 20px
.btn-footer
  position: absolute
  bottom: 35px
  left: 10px
  right: 10px
  background: transparent
.btn-del
  padding: 0px 0px
  margin: 0px 0px

</style>

