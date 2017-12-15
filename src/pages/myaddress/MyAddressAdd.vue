//新建地址
<template>
  <div class="page">
    <toolbar :title="$t(title)" 
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      @goback="back"
    >
    </toolbar>
    <div class="content" v-if="!showScanner">
      <card padding="10px 10px" class="mycard">
        <div class="card-content" slot="card-content">
          <ul class="settings-ul">
            <li class="settings-li">
              <v-text-field name="input-name" required dark
                            :label="$t(namelabel)" v-model="name"
              ></v-text-field>
            </li>
            <li class="settings-li">
              <v-text-field name="input-address" required dark
                            :label="$t(addlabel)" v-model='address'
              ></v-text-field>
            </li>
            <li class="settings-li">
              <v-text-field name="input-memo" :label="$t(memolabel)"
                            v-model='memo'    
                            dark  
              ></v-text-field>
            </li>
          </ul>
        </div>
      </card>
      <div style="flex: 1;"></div>
      <v-footer>        
      <v-layout row  wrap>
        <v-flex xs12>
          <v-btn class='add primary' :loading="working" block dark large @click="add">{{$t(buttonlabel)}}</v-btn>
        </v-flex>
      </v-layout>  
    </v-footer>
    </div>
    
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import { mapState, mapActions, mapGetters} from 'vuex'
import {isValidateAddress} from '@/api/account'

export default {
  data(){
    return {
      title: 'MyAddress.Add',
      showmenuicon: false,
      showbackicon: true,
      showScanner: false,
      namelabel: 'ContactAdd.name',
      addlabel: 'ContactAdd.address',
      memolabel: 'ContactAdd.memo',
      buttonlabel: 'Add',
      name: null,
      address: null,
      memo: null,
      working: false,
    }
  },
   computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      myaddresses: state => state.app.myaddresses || [],

    }),
    ...mapGetters([
    ]),
  
  },
  mounted(){
  },
  methods: {
    ...mapActions(['createMyAddress']),
    back() {
      this.$router.back()
    },
    add() {
      if(this.working)return
      if((!this.name)||this.name.length===0)return
      if((!this.address)||this.address.length===0)return
      if(!this.validate())return
      this.working = true
      this.createMyAddress({name:this.name,address:this.address,memo:this.memo})
        .then(data=>{
          this.$toasted.show(this.$t('MyAddress.SaveSuccess'))
          this.$router.push(`/myaddress/list`)
        })
        .catch(err=>{
          console.error(err)
          this.$toasted.error(this.$t('MyAddress.SaveFail'))
        })


    },
    
    validate(){
      //判断name不重复，判断address不重复
      this.name = this.name.trim()
      this.address = this.address.trim()
      let duplicateName = false,duplicateAddress = false
      
      for(var i=0,n=this.myaddresses.length;i<n;i++){
        let data = this.myaddresses[i]
        if(data.name === this.name ){
          duplicateName = true
          break
        }
        if(data.address === this.address){
          duplicateAddress = true
          break
        }
      }
      if(duplicateName){
        this.$toasted.error(this.$t('MyAddress.DuplicateName'))
        return false
      }
      if(duplicateAddress){
        this.$toasted.error(this.$t('MyAddress.DuplicateAddress'))
        return false
      }
      return true
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
  .content
    padding: 8px 8px
    display flex
    flex-direction column
    //min-height calc(100vh - 48px)
.settings-ul
  padding 0 5px

.footer
  width: 100%;
  background: transparent;
.add
  font-size: 16px
</style>

