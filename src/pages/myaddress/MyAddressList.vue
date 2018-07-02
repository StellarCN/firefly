/**
 * 常用信息管理页签
 */
<template>
  <div class="page">
    <toolbar :title="$t(title)" :showbackicon="true"  @goback="back"  >
      <!-- <div class="right" slot="right-tool" @click="toAdd">
        <i class="material-icons">&#xE145;</i>
      </div> -->
      <v-btn icon slot='right-tool' @click="toAdd">
        <i class="material-icons font28">&#xE145;</i>
      </v-btn>
    </toolbar>
    <div class="content">
      <card padding="10px 10px" class="infocard">
        <div class="card-content" slot="card-content">
          <div v-if='!this.myaddresses.length'>
            {{$t('Error.NoData')}}
          </div>
          <div class='list' v-else>
            <v-text-field append-icon="search" v-model="search" dark 
                          class="search"  hide-details single-line >
            </v-text-field>
            <div class="myaddress-row" v-for="(data,index) in filtered" :key="index"
               v-touch="{
                    left: () => selectedItem = index,
                    right: () => selectedItem = null
                  }"
              >
              <v-layout class="myaddress-li third-li" row wrap v-swiper=2  @click.stop="toView(data)">
                <v-flex xs4 class="myaddress-wrapper">
                  <div class="myaddress-name grey--text text--lighten-1">{{data.name}}</div>
                </v-flex>
                <v-flex xs6 class="myaddress-wrapper">
                  <div class="myaddress-address grey--text text--darken-1">{{data.address|shortaddress}}</div>
                </v-flex>
              </v-layout>
              <div class="operate-box">
                <div class="del"     @click.stop="del(data)"    >{{$t('Delete')}} </div>
                <div class="receive" @click.stop="toEdit(data)">{{$t('Modify')}}</div>
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
      title: 'MyAddress.Title',
      search: '',
      working: false,
      delok: false,
      delerror: false,
      selectedItem: null,
    }
  },
  computed: {
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      myaddresses: state => state.app.myaddresses||[]
          
    }),
    filtered() {
      let content = this.search.toLowerCase()
      return this.myaddresses.filter(data => {
        return data.name.toLowerCase().includes(content)||data.address.toLowerCase().includes(content)
      })
    },
  },
  mounted() {
  },
  methods: {
    ...mapActions(['deleteMyAddress']),
    back(){
      this.$router.back()
    },
    toAdd() {
      //跳转到添加联系人菜单
      this.$router.push({name: 'MyAddressAdd'})
    },
    toEdit(data){
      this.$router.push({name: 'MyAddressEdit', params: {name: data.name}})
    },
    toView(data){
      this.$router.push({name: 'MyAddressView', params:{name: data.name}})
    },
    del(data) {
      //this.deleteContact({id_temp: contact.id, contact})
      if(this.working)return
      this.working = true
      this.deleteMyAddress(data)
        .then(result=>{
          this.delok = true
          this.delerror  = false
          this.selectedItem = null
          setTimeout(()=>{
            this.working = false
          },1000)
          this.$toasted.show(this.$t('MyAddress.DeleteSuccess'))
          try{
              let doms = window.document.querySelectorAll('.myaddress-li')
              for(var i=0,n=doms.length;i<n;i++){
                let element = doms[i]
                element.style.transition = "0.3s"
                element.style.marginLeft = 0 + "px"
              }
            }catch(error){
              console.error(error)
            }

        })
        .catch(err=>{
          console.error(err)
          this.$toasted.error(this.$t('MyAddress.DeleteFail'))
          this.delok = false
          this.delerror  = true
          setTimeout(()=>{
            this.working = false
          },1000)
        })
    },
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
  .content
    padding: 10px 10px
    .infocard
      margin 0
      padding-left 15px
      padding-right 15px
      box-shadow 0
      -webkit-box-shadow 0

.list
  overflow: hidden
  position: relative
  background: $primarycolor.gray
  border-radius:5px
  .search
    padding-bottom 25px
    padding 10px 2px
    border-radius:5px
    background:$secondarycolor.gray
  .myaddress-row
    overflow: hidden
    position: relative
    .myaddress-li
      position: relative
      z-index: 2
      padding: 2px 2px
      background: $secondarycolor.gray
      width: 100%
      min-height 50px
      border-radius:5px
      .myaddress-wrapper
        font-size: 16px
        display flex
        align-items:center;
        justify-content:left;
        margin-left: 10px;
        .myaddress-name
          padding-left:20px
          overflow: hidden
          text-overflow:ellipsis
          white-space: nowrap
        .avatar
          font-size: 1.2em
          color: #21ce90
        .myaddress-address
          font-weight: lighter
          font-size: 14px
.assets-row:last-child
  border-bottom: 0px
.operate-box 
  position: absolute
  z-index: 1
  height: 100%
  right: 0
  top: 0
  display: flex
  padding: 1px 0px
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
    border-left: 1px solid $primarycolor.gray
    // border-left: 1px solid $secondarycolor.gray
  .del
    background-color: $primarycolor.gray
    border-right: 1px solid $primarycolor.gray
    color: $primarycolor.red
    // background-color: $secondarycolor.red
    // border-right: 1px solid $secondarycolor.gray
.contact-avatar
  min-width 64px
  min-height 64px
.selected
  -webkit-transform: translate(-40%, 0)
  -webkit-transition: 0.3s
  transform: translate(-40%, 0)
  transition: 0.3s

</style>

