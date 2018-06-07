<template>
  <div class="page">
    <toolbar :title="$t(title)" 
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      @goback="back"
    >
      <!--<div class="right" slot="right-tool">
        <span class="toolbar-ico" @click="scan">
          <i class="material-icons" v-if="showScanner">&#xE5CD;</i>
          <i class="iconfont icon-erweima1" v-else></i>
        </span>
      </div>-->
    </toolbar>
    <!--
    <q-r-scan 
      @finish="qrfinish" 
      @close="qrclose" 
      :validator="qrvalidator" 
      v-if="showScanner"
    ></q-r-scan>-->
    <div class="content">
      <card padding="10px 10px" class="mycard">
        <div class="card-content" slot="card-content">
          <ul class="settings-ul">
            <li>
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
              <v-select name ='memotypeselect' v-bind:items="items" v-model="memotype"
                        :label="$t(memotypelabel)"  dark cle
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
            </li>
          </ul>
        </div>
      </card>
      <div style="flex: 1;"></div>
    <v-footer>        
      <v-layout row  wrap>
        <v-flex xs12>
          <v-btn class='modify'  block dark large @click="modifyContact">{{$t('Modify')}}</v-btn>
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
import {isValidMemo} from '@/api/account'

let loseCode = function(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    let char = str.charCodeAt(i);
    hash += char;
  }
  return hash;
}

export default {
  data(){
    return {
      title: 'Contact.ContactModify',
      showmenuicon: false,
      showbackicon: true,
      namelabel: 'ContactAdd.name',
      addlabel: 'ContactAdd.address',
      memotypelabel: 'ContactAdd.memotype',
      memolabel: 'ContactAdd.memo',
      buttonlabel: 'Modify',
      items: ['None','Hash', 'Text', 'ID', 'Return'],
      name: '',
      address: '',
      memotype: '',
      memo: '',
      memorequired: false
    }
  },
   computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      asset: state => state.asset.selected,
      contacts: state => state.app.contacts,
    }),
    ...mapGetters([
    ]),
    contact() {
      const id = parseInt(this.$route.params.id)
      return this.contacts.filter(function(c) {
        return c.id === id
      }) [0]
    },
  },
  mounted(){
    this.address = this.$route.query.address,
    this.name = this.contact.name,
    this.address = this.contact.address,
    this.memotype = this.contact.memotype,
    this.memo = this.contact.memo
  },
  methods: {
    ...mapActions(['updateContact']),
    back() {
      this.$router.back()
    },
    onMemoTypeInput () {
      if(this.memotype === 'None'){
        this.memo = ''
        this.memorequired = false
      }else{
        this.memorequired = true
      }
    },
    modifyContact() {
      //let length = this.accountData.contacts.length
      let contact_temp = {name: this.name, address: this.address, memotype: this.memotype, memo: this.memo}
      let hash_temp = loseCode(this.name + this.address + this.memotype + this.memo)
      if (hash_temp === this.contact.hash) {
        this.$toasted.error(this.$t('Error.ContactExist'))
        return
      }
      if(contact_temp.memotype !== 'None' && !isValidMemo(contact_temp.memotype, contact_temp.memo)) {
        this.$toasted.error(this.$t('Error.MemoIsInvalid'))
        return
      }
      //console.log(contact_temp)
      //var index = -1
      //for(var i = 0, n = this.contacts.length; i<n; i++){
      //  if(this.contacts[i].hash === this.contact.hash){
      //    index = i
      //    break
      //  }
      //}
      //console.log('------------------------'+index)
      contact_temp.hash = hash_temp
      contact_temp.id = this.contact.id
      var id_temp = contact_temp.id
      console.log(contact_temp)
      this.updateContact({id_temp, contact:contact_temp})
      this.$router.back()
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
  width: 100%;
  background: transparent;
.modify
  background-color #21ce90  !important
</style>
