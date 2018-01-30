/**
 * 
 */
<template>
  <div class="page">
    <toolbar :title="$t(title)" 
      :showmenuicon="showmenuicon" 
      :showbackicon="showbackicon"
      @goback="back"
      ref="toolbar"
    />
    <div class="content">
      <card padding="10px 10px" class="mycard">
        <div class="card-content  contact-name grey--text text--lighten-1" slot="card-content">
            <v-avatar :tile=false :size="avatarSize"  class="grey darken-4">
                    <i class="avatar iconfont icon-erweima"></i>
                    </v-avatar>
              {{contact.name}}
        </div>
      </card>
      <v-subheader dark class="grey--text text--lighten-1">{{$t(detailLabel)}}</v-subheader>
      <card padding="10px" class="mycard">
        <div class="card-content contact-info grey--text text--lighten-1" slot="card-content">
          <v-subheader dark class='grey--text text--lighten-1'>{{$t(addressLabel)}}</v-subheader>
           <p>   {{contact.address}}</p>
          <div v-if='contact.memo'>
          <v-subheader dark class="grey--text text--lighten-1">
            {{$t(memoLabel)}} ({{contact.memotype}})           </v-subheader>
              {{contact.memo}}
          </div>
        </div>
      </card>
      <div style="flex: 1;"></div>
      <v-footer>        
        <v-layout row  wrap>
          <v-flex xs12>
            <v-btn class='send'  block dark large @click="send">{{$t(sendLabel)}}</v-btn>
          </v-flex>
          <v-flex xs6>
            <v-btn class='moddel' block flat dark @click="deleteThisContact" >{{$t('Delete')}}</v-btn>
          </v-flex>
          <v-flex xs6>
            <v-btn class='moddel' block flat dark :to="{name: 'ModifyContact', params:{id:contact.id}}" >{{$t('Modify')}}
            </v-btn>
          </v-flex>
        </v-layout>  
      </v-footer>
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
      title: 'Menu.Contacts',
      detailLabel: 'ContactAdd.details',
      addressLabel: 'ContactAdd.address',
      memoLabel: 'ContactAdd.memo',
      sendLabel: 'Send',
      showbackicon: true,
      showmenuicon: false,
      avatarSize: '56px'
    }
  },
  computed: {
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      allcontacts: state => state.app.contacts,
      islogin: state => state.accounts.accountData.seed ? true:false,
    }),
    contact() {
      const id = parseInt(this.$route.params.id)
      return this.allcontacts.filter(function(c) {
        return c.id === id
      }) [0]
    },
  },
  mounted() {
    //console.log(this.contact.memo)
  },
  methods: {
    ...mapActions(['deleteContact']),
    back() {
      this.$router.back()
    },
    send() {
      //跳转到添加联系人菜单
      console.log('ready to send asset to this contact')
      if(!this.islogin){
        //this.$toasted.error(this.$t('Error.NoPassword'))
        this.$refs.toolbar.showPasswordLogin()
        return
      }
      this.$router.push({name: 'SendAsset', params: {destination: this.contact.address, memo_type: this.contact.memotype, memo: this.contact.memo}})
    },
    deleteThisContact() {
      //console.log('delete this contact ' + this.contact.id)
      var id_temp = this.contact.id
      //console.log('===============================================id ===== ' + id_temp)
      this.deleteContact({id_temp, contact: this.contact})
      this.$router.push({name: 'ContactsList'})
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
    display flex
    flex-direction column
    //min-height calc(100vh - 48px)
    .mycard
      .contact-name
        min-width 100%
        display flex
        flex-direction column
        justify-content space-around
        align-items center
        text-align center
        min-height 110px
        .avatar 
          font-size 1.2em
          color  #21ce90
      .contact-info 
          padding 0 6px
          font-size 1.2em
          font-weight lighter
          word-wrap wrap
          word-break break-all
          .subheader
            padding 0
            height 20px
.footer
  width 100%
  height 100%
  background: transparent;
.send
  background-color #21ce90  !important
.moddel
   color #21ce90 !important

</style>

