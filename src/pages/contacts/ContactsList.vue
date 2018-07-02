/**
 * 
 */
<template>
  <div class="page">
    <toolbar :title="$t(title)" :showbackicon="true"  @goback="back">
      <v-btn icon slot='right-tool' @click="toAddContact">
        <i class="material-icons font28">&#xE145;</i>
      </v-btn>
    </toolbar>
    <div class="content">
      <card padding="0px 0px" class="infocard">
        <div class="card-content" slot="card-content">
          <div v-if='!this.allcontacts.length'>
            {{$t('Error.NoContactYet')}}
          </div>
          <div class='contacts' v-else>
            <v-text-field append-icon="search" v-model="search" dark 
                          class="search"  hide-details single-line >
            </v-text-field>
            <div class="contracts-list">
               <div class="contacts-row" v-for="(contact,index) in filteredContacts" :key="contact.id"
                  v-touch="{
                    left: () => selectedItem = index,
                    right: () => selectedItem = null
                  }">
                <v-layout class="mycontacts-li third-li" row wrap v-swiper=2.5 @click.stop="toContactDetail(contact.id)">
                  <v-flex xs2 class="mycontacts-wrapper">
                    <v-avatar :tile=false class="grey darken-4 contact-avatar">
                      <i class="avatar iconfont icon-erweima"></i>
                      </v-avatar>
                  </v-flex>
                  <v-flex xs4 class="mycontacts-wrapper">
                    <div class="contact-name grey--text text--lighten-1">{{contact.name}}</div>
                  </v-flex>
                  <v-flex xs4 class="mycontacts-wrapper">
                    <div class="contact-address grey--text text--darken-1">{{contact.address|miniaddress}}</div>
                  </v-flex>
                </v-layout>
                <div class="operate-box" >
                  <div class="del"     @click.stop="del(contact)"    >{{$t('Delete')}} </div>
                  <div class="receive" @click.stop="toModifyContact(contact.id)">{{$t('Modify')}}</div>
                  <div class="send"    @click.stop="sendto(contact)"   >{{$t('Send')}}   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </card>
    </div>
    <loading :show="working" :loading="working" :success="delok" :fail='delerror' />
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import { mapState, mapActions} from 'vuex'
import Loading from '@/components/Loading'
export default {
  data() {
    return {
      title: 'Menu.Contacts',
      search: '',
      avatarSize: '64px',

      working: false,
      delok: false,
      delerror: false,

      selectedItem: null
    }
  },
  computed: {
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      allcontacts: state => state.app.contacts,
          
    }),
    filteredContacts() {
      return this.allcontacts.filter(contact => {
        return contact.name.toLowerCase().includes(this.search.toLowerCase())
      })
    },
  },
  mounted() {
  },
  methods: {
    ...mapActions(['deleteContact']),
    back(){
      this.$router.back()
    },
    toAddContact() {
      //跳转到添加联系人菜单
      this.$router.push({name: 'AddContact'})
    },
    toModifyContact(contactid){
      this.$router.push({name: 'ModifyContact', params: {id: contactid}})
    },
    toContactDetail(contactid){
      this.$router.push({name: 'ContactDetails', params:{id:contactid}})
    },
    del(contact) {
      if(this.working)return
      this.working = true
      this.deleteContact({id_temp: contact.id, contact})
        .then(data=>{
          this.delok = true
          this.delerror  = false
          this.selectedItem = null
          setTimeout(()=>{
            this.working = false
          },1000)
        })
        .catch(err=>{
          console.error(err)
          this.delok = false
          this.delerror  = true
          setTimeout(()=>{
            this.working = false
          },1000)
        })
    },
    sendto(contact) {
      console.log('send asset to this concact ' + contact.id)
      this.$router.push({name: 'SendAsset', params: {destination: contact.address, memo_type: contact.memotype, memo: contact.memo}})
    }
  },
  components: {
    Toolbar,
    Card,
    Loading,
  }
}
</script>


<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
.page
  background: $primarycolor.gray
  color: $primarycolor.font
  font-size: 16px
  overflow-y: auto
  .content
    .infocard
      margin 0
      padding-left 15px
      padding-right 15px
      box-shadow 0
      -webkit-box-shadow 0

.contacts
  overflow: hidden
  position: relative

  .search
    padding-bottom 25px
    padding 15px 15px 15px 15px
    background-color:$secondarycolor.gray
    border-radius:5px
    
   
  .contacts-row
    overflow: hidden
    position: relative
    border-bottom: 1px solid $secondarycolor.font
    background-color:$primarycolor.gray
    border-radius:5px
    &:last-child
      border-bottom: 0px
    .mycontacts-li
      position: relative
      z-index: 2
      padding: 4px 0px
      background: $secondarycolor.gray
      width: 100%
      min-height 45px
      border-radius:5px
      .mycontacts-wrapper
        font-size: 16px
        display flex
        align-items:center;
        justify-content:left;
        margin-left: 10px;
        .contact-name
          padding-left:10px
          overflow: hidden
          text-overflow:ellipsis
          white-space: nowrap
        .avatar
          font-size: 1.2em
          color: #21ce90
        .contact-address
          font-weight: lighter;
        .myassets
          .myassets-issuer
            color: $secondarycolor.font
        .myassets-balance
          text-align: right
          color: $secondarycolor.font
          .balance
            color: $primarycolor.green
            font-size: 20px
            padding-right: 10px
        .myassets-reserve
          text-align: right  
          color: $secondarycolor.font
          .balance
            padding-right: 10px

.assets-row:last-child
  border-bottom: 0px
.operate-box 
  position: absolute
  z-index: 1
  height: 100%
  right: 0
  top: 0
  display: flex
  .send
  .receive
  .del
    display: flex
    justify-content: center
    align-items: center
    background-color: $primarycolor.gray
    // background-color: $secondarycolor.green
    color: $primarycolor.green
    padding: 0 12px
  .receive
    // border-left: 1px solid $secondarycolor.gray
    color:$primarycolor.green
  .del
    background-color: $primarycolor.gray
    color:$primarycolor.red
    // background-color: $secondarycolor.red
    // border-right: 1px solid $secondarycolor.gray
.contact-avatar
  min-width 42px
  min-height 42px
.contracts-list
  border-radius:5px
.selected
  -webkit-transform: translate(-50%, 0)
  -webkit-transition: 0.3s
  transform: translate(-50%, 0)
  transition: 0.3s

</style>

