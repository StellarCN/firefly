//新建联系人 
<template>
  <div class="page" v-bind:class="{hidebackground: showScanner}">
    <toolbar :title="$t(title)" 
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      @goback="back"
    >
      <div class="right" slot="right-tool">
        <span class="toolbar-ico" @click="scan">
          <i class="material-icons font28" v-if="showScanner">&#xE5CD;</i>
          <i class="iconfont icon-erweima1 font28" v-else></i>
        </span>
      </div>
    </toolbar>
    <q-r-scan 
      @finish="qrfinish" 
      @close="qrclose" 
      :validator="qrvalidator" 
      v-if="showScanner"
    ></q-r-scan>
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
            <v-layout row wrap style='height:65px'>
            <v-flex xs2 d-flex>
              <v-flex class="memoswitch">{{$t('Memo')}}</v-flex>
            </v-flex>
            <v-flex xs2 offset-xs8>
            <v-switch style="padding-left:25px;padding-top:18px;"  v-model="memoswitch" dark color="primary" hide-details/>
            </v-flex>
            </v-layout>
            <div v-if="memoswitch">
              <v-select v-bind:items="memotypes" v-model="memotype"
                        :label="$t('MemoType')" dark 
                        v-on:input='onMemoTypeInput()'
              /> 
              <v-text-field
                name="memo"
                :label="$t('MemoContent')"
                v-model="memo"
                dark 
                type="text"
                :hint="$t('required')" 
                required
                :disabled="this.memotype === null || this.memotype === 'None'"
              ></v-text-field>
            </div>
            <!-- <li class="settings-li">
              <v-select v-bind:items="items" v-model="memotype"
                        :label="$t(memotypelabel)" dark 
                       append-icon=""
                       v-on:input='onMemoTypeInput()'
              ></v-select>
            </li>
            <li class="settings-li">
              <v-text-field name="input-memo" :label="$t(memolabel)"
                            v-model='memo'    
                            dark   
                            :hint="$t('required')" 
                            :required='this.memorequired' 
                            :persistent-hint='this.memorequired'
                            :disabled="memotype === 'None' || memotype === ''"
              ></v-text-field>
            </li> -->
          </ul>
        </div>
      </card>
      <div style="flex: 1;"></div>
      <v-footer v-if="!showScanner">        
        <v-layout row  wrap>
          <v-flex xs12>
            <v-btn class='add'  block dark large @click="addContact">{{$t(buttonlabel)}}</v-btn>
          </v-flex>
        </v-layout>  
      </v-footer>
    </div>

  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import QRScan from '@/components/QRScan'
import { mapState, mapActions, mapGetters} from 'vuex'
import {isValidateAddress, isValidMemo} from '@/api/account'
import {importContact} from '@/api/qr.js'

let loseCode = function(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    let char = str.charCodeAt(i);
    hash += char;
  }
  return hash;
}

let containObject = function(obj, list) {
  let i;
  for (i = 0; i < list.length; i++) {
    if (list[i].hash === obj) {
      return true;
    }
  }
  return false;
}

export default {
  data(){
    return {
      title: 'AddContact',
      showmenuicon: false,
      showbackicon: true,
      showScanner: false,
      namelabel: 'ContactAdd.name',
      addlabel: 'ContactAdd.address',
      memotypelabel: 'ContactAdd.memotype',
      memolabel: 'ContactAdd.memo',
      buttonlabel: 'Add',
      name: '',
      address: '',

      memoswitch: false, //show memo 
      memotypes: ['None','Text', 'ID', 'Hash','Return'],
      memotype: null,
      memo: null,
    }
  },
   computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      asset: state => state.asset.selected,
      allcontacts: state => state.app.contacts,
      nextContactId: state => state.app.nextContactId,
    }),
    ...mapGetters([
    ]),
  
  },
  mounted(){
    //this.address = this.$route.query.address
    this.address = this.$route.params.address
    //console.log(this.address);
    //console.log(this.$route)
  },
  methods: {
    ...mapActions(['createContact']),
    back() {
      this.$router.back()
    },
    onMemoTypeInput () {
      if(this.memotype === 'None'){
        this.memotype = null
        this.memo = ''
        this.memoswitch=false
      }
    },
    addContact() {
      if(!this.name){
        this.$toasted.error(this.$t('ContactAdd.name'))
        return
      }
      if(!isValidateAddress(this.address)) {
        this.$toasted.error(this.$t('Error.NotValidStellarAddress'))
        return
      }
      if(this.memoswitch){
        if(!this.memotype || !this.memo){
          this.$toasted.error(this.$t('Error.MemoIsRequired'))
          return
        }
        if(!isValidMemo(this.memotype, this.memo)) {
          this.$toasted.error(this.$t('Error.MemoIsInvalid'))
          return
        }
      }

      var contact_temp = {name:     this.name, 
                          address:  this.address, 
                          memotype: this.memoswitch ? this.memotype : null, 
                          memo:     this.memoswitch ? this.memo : null
                          }
      var hash_temp = loseCode(contact_temp.address + contact_temp.memotype + contact_temp.memo)
      if (containObject(hash_temp, this.allcontacts)) {
        this.$toasted.error(this.$t('Error.ContactExist'))
        return
      }
      contact_temp.hash = hash_temp
      contact_temp.id = this.nextContactId
      this.createContact(contact_temp)
      this.$toasted.info(this.$t('ContactAdd.Sussess'))
      this.$router.push({name:'MyContacts'})
      //let length = this.accountData.contacts.length
      //let contact_temp = {id: length , name: this.name, address: this.address, memotype: this.memotype, memo: this.memo}
      //console.log(contact_temp)
      //this.createContact(contact_temp)
      //this.$toasted.info('yahoo!')
      //this.$router.push({name:'MyContacts'})
    },
    scan() {
      //只能识别stargazer类似的格式数据
      if(this.showScanner){
        this.showScanner = false
        this.title = 'AddContact'
      }else{
        this.showScanner = true
        this.title = 'Title.Scan'
      }
    },
    qrvalidator(text){   
      console.log(`validate ---- qrscanner --- text -- ${text}`)
      return true

    },
    qrfinish(result){
      console.log(` qrscanner --- finish -- ${result}`)
      this.showScanner = false
      this.title = 'AddContact'
      console.log(result)
      let res = importContact(result)
      console.log(res)
      this.name = res.ret.name
      this.address = res.ret.stellar_id
      if(res.ret.memo_type){
        this.memoswitch = true
        this.memotype = res.ret.memo_type
        this.memo = res.ret.memo
      }
      //this.federation = result.ret.fed
    },
    qrclose(){
      this.showScanner = false
      this.title = 'AddContact'
    },
  },
  components: {
    Toolbar,
    Card,
    QRScan,
  }
}
</script>

<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
.page
  background: $primarycolor.gray
  .content
    display flex
    flex-direction column
    //min-height calc(100vh - 48px)
.settings-ul
  padding 0 5px

.footer
  width: 100%;
  background: transparent;
.add
  background-color #21ce90  !important
.hidebackground
  background none
  background-color: transparent
.right
  .toolbar-ico
    .iconfont
      font-size: 24px
      color: $primarycolor.font
    .material-icons
      font-size: 24px
      color: $primarycolor.font

.memoswitch
  font-size:16px
  align-self center
  color: rgba(255,255,255,0.5)
</style>

