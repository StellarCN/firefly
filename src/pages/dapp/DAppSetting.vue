//DAPP配置界面，用户可以自定义引用DAPP
//显示所有自定义引用的第三方dapp
<template>
  <div class="page" dark>
    <toolbar :title="$t('CustomDApp')" :showbackicon="true"  
      @goback="back" :shadow="false" lockpass  ref="toolbar">
      <v-btn icon slot='right-tool' @click="toAdd">
        <i class="material-icons font28">&#xE145;</i>
      </v-btn>
    </toolbar>

    <div class="content">
      <div class="app-row" v-for="(app,index) in myapps" :key="index">
        <v-layout class="app-row-li third-li" row wrap v-swiper=1.5 @click.stop="modify(index,app)">
          <v-flex xs2 class="app-wrapper">
            <v-avatar :tile=false class="grey darken-4 app-avatar">
              <span class="white--text headline">{{app.title.substring(0,1)}}</span>  
            </v-avatar>
          </v-flex>
          <v-flex xs8 class="app-wrapper">
            <div class="app-title text--lighten-1">{{app.title}}</div>
            <div class="app-link grey--text text--lighten-2">{{app.site}}</div>
          </v-flex>
        </v-layout>
        <div class="operate-box" >
          <div class="del"     @click.stop="del(index,app)"    >{{$t('Delete')}} </div>
          <div class="receive" @click.stop="modify(index,app)">{{$t('Modify')}}</div>
        </div>
      </div>
    </div>
    <loading :show="working" :loading="working" :success="dealok" :fail='dealfail' />

    <v-dialog v-model="showDlg" persistent max-width="90%">
      <v-card>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              
              <v-flex xs12 sm6 md4>
                <v-text-field :label="$t('ContactAdd.name')" clearable required v-model="selected.title"></v-text-field>
              </v-flex>
              <v-flex xs12 sm6 md4>
                <v-text-field :label="$t('ContactAdd.address')" clearable required v-model="selected.site"></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary darken-1" flat @click.stop="cancel">{{$t('Button.Cancel')}}</v-btn>
          <v-btn color="error darken-1" flat @click.stop="save">{{$t('Save')}}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--删除确认-->
    <v-dialog v-model="delConfirmDlg" persistent max-width="90%">
      <v-card>
        <v-card-text>{{$t('Delete')}}{{$t('CustomDApp')}}
          <span class="error--text pl-1 pr-1">{{selected.title}}</span>  ?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary darken-1" flat @click.stop="cancelDelete">{{$t('Button.Cancel')}}</v-btn>
          <v-btn color="error darken-1" flat @click.stop="doDelete">{{$t('Button.OK')}}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapState, mapActions} from 'vuex'
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import Loading from '@/components/Loading'

// export const FFW_EVENT_TYPE_PAY = 'pay'
// export const FFW_EVENT_TYPE_PATHPAYMENT = 'pathPayment'
// export const FFW_EVENT_TYPE_SIGN = 'sign'
// export const FFW_EVENT_TYPE_BACKUP = 'backup'
// export const FFW_EVENT_TYPE_RECOVERY = 'recovery'
// export const FFW_EVENT_TYPE_TRUST = 'trust'

export default {
  data(){
    return {
      selectedIndex: -1,
      selected: {},//当前选中的app，可以进行编辑
      showDlg: false,
      type: null,//delete还是modify
      delConfirmDlg:false,
      working: false,
      dealok: false,
      dealfail: false,
    }
  },
   computed:{
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      islogin: state => (state.accounts.accountData.seed ? true : false),
      myapps: state => state.app.myapps,
    }),
  },
  beforeMount () {
  },
  mounted () {

  },
  methods: {
    ...mapActions(['addMyApp', 'deleteMyApp', 'modifyMyApp']),
    back(){
      this.$router.back()
    },
    //弹出新增窗口
    toAdd(){
      this.type = 'add'
      this.selectedIndex = -1
      this.selected = {}
      this.showDlg = true
    },
    del(index,app){
      this.type = 'delete'
      this.selectedIndex = index
      this.selected = Object.assign({}, app)
      this.delConfirmDlg = true
    },
    modify(index,app){
      this.type = 'modify'
      this.selectedIndex = index
      this.selected = Object.assign({}, app)
      this.showDlg = true
    },
    cleanData(){
      this.type = null
      this.selectedIndex = -1
      this.selected = {}
      this.showDlg = false
      this.delConfirmDlg = false
    },
    cancel(){
      this.cleanData()
    },
    save(){
      if(!this.selected.title || !this.selected.site)return
      if(this.working)return
      this.working = true
      if(this.type === 'add'){
        this.addMyApp(this.selected)
          .then(response=>{
            this.success()
            this.cleanData()
          })
          .catch(err=>{
            this.fail()
          })
        return
      }
      if(this.type === 'modify'){
        this.modifyMyApp({index: this.selectedIndex, app: this.selected})
          .then(response=>{
            this.success()
            this.cleanData()
          })
          .catch(err=>{
            this.fail()
          })
        return
      }
    },
    cancelDelete(){
      this.cleanData()
    },
    doDelete(){
      if(this.selectedIndex < 0)return
      if(this.working )return
      this.deleteMyApp(this.selectedIndex)
        .then(response=>{
            this.success()
            this.cleanData()
          })
          .catch(err=>{
            this.fail()
          })
        return
    },
    success(){
      this.dealok = true
      setTimeout(()=>{
        this.working = false
        this.dealok = false
        this.dealfail =false
      },300)
    },
    fail(err){
      this.dealfail = true
      setTimeout(()=>{
        this.working = false
        this.dealok = false
        this.dealfail =false
      },300)
    }



  },
  components: {
    Toolbar,
    Loading,
    Card,
  }
}
</script>


<style lang="stylus" scoped>
@require '../../stylus/color.styl'
.app-card
  background: $primarycolor.gray


.content
  overflow: hidden
  position: relative
  .app-row
    overflow: hidden
    position: relative
    border-bottom: 1px solid $secondarycolor.font
    background-color:$primarycolor.gray
    border-radius:5px
    &:last-child
      border-bottom: 0px
    .app-row-li
      position: relative
      z-index: 2
      padding: 4px 0px
      background: $secondarycolor.gray
      width: 100%
      min-height 45px
      border-radius:5px
      .app-wrapper
        font-size: 16px
        align-items:center;
        justify-content:left;
        margin-left: 10px;
        .app-title
        .app-link
          padding-left:10px
          overflow: hidden
          text-overflow:ellipsis
          white-space: nowrap
        .avatar
          font-size: 1.2em
          color: #21ce90
        .app-link
          color: $secondarycolor.font!important

.operate-box 
  position: absolute
  z-index: 1
  height: 100%
  right: 0
  top: 0
  display: flex
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
.app-avatar
  min-width 42px
  min-height 42px

</style>
