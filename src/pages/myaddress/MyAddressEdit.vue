/***
 * 修改我的地址
 */
<template>
  <div class="page">
    <toolbar :title="$t(title)" 
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      @goback="back"
    >
    </toolbar>
    <div class="content">
      <card padding="10px 10px" class="mycard">
        <div class="card-content" slot="card-content">
          <ul class="settings-ul">
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
          <v-btn class='modify primary' :loading="working" block dark large @click="save">{{$t('Modify')}}</v-btn>
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

export default {
  data(){
    return {
      title: 'MyAddress.Edit',
      showmenuicon: false,
      showbackicon: true,
      namelabel: 'ContactAdd.name',
      addlabel: 'ContactAdd.address',
      memolabel: 'ContactAdd.memo',
      buttonlabel: 'Modify',
      name: '',
      address: '',
      memo: '',
      index: -1,
      working: false
    }
  },
   computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      myaddresses: state => state.app.myaddresses || []
    }),
    ...mapGetters([
    ]),
    

  },
  mounted(){
    this.name = this.$route.params.name
    let data = this.selected()
    console.log(data)
    this.index = data.index
    this.address = data.data.address
    this.memo = data.data.memo
  },
  methods: {
    ...mapActions(['updateMyAddress']),
    back() {
      this.$router.back()
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
    save() {
      if(this.working)return
      if((!this.name)||this.name.length===0)return
      if((!this.address)||this.address.length===0)return
      //校验,名称不能重复，地址不能重复
      if(!this.validate())return
      this.working = true
      this.updateMyAddress({name: this.name,address: this.address, memo: this.memo})
        .then(data=>{
          console.log(data)
          this.working = false
          this.$toasted.show(this.$t('MyAddress.SaveSuccess'))
        })
        .catch(err=>{
          console.error(err)  
          this.working = false
          this.$toasted.error(this.$t('MyAddress.SaveFail'))
        })
    },
    validate(){
      //判断name不重复，判断address不重复
      this.name = this.name.trim()
      this.address = this.address.trim()
      let duplicateName = false,duplicateAddress = false
      
      for(var i=0,n=this.myaddresses.length;i<n;i++){
        if(i === this.index ) continue
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
  .content
    padding: 8px 8px
    display flex
    flex-direction column
    //min-height calc(100vh - 48px)
.settings-ul
  padding 0 5px

.footer
  background: transparent;
.modify
  background-color #21ce90  !important
</style>

