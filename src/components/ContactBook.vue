/**
 * 通讯录功能，显示所有的数据，让用户来选择，顶部是取消和确定按钮，可以给默认值
 * 1. 可以指定只显示账户、联系人、我的地址中的一种或几种
 * 2. 可以有默认值，都是指定name
 * 3. 通过取消或确定按钮来实现关闭和选中操作，如果选中了某一个，可以直接调用确定进行关闭
 */
<template>
  <div class="contact-book">
    <!--标题栏-->
    <div class="bookbar">
      <div class="bar-blank">&nbsp;</div>
      <div class="bar-title">{{$t(title)}}</div>
      <div class="bar-close"  @click.stop="close">
        <i class="material-icons">&#xE5CD;</i>
      </div>
    </div>
     
    <div class="book-content">
      
      <!--账户-->
      <div class="account-content" v-if="showaccount && accounts.length >0">
        <card class="account-card" padding="5px 5px" margin="10px 0px">
          <div class="card-content" slot="card-content">
            <div class="book-title">{{$t('Title.Account')}}</div>
            <ul class="book-list">
              <li class="book-row" v-for="(item,index) in accounts" :key="index" @click="chose('account',item)">
                <div class="book-name">{{ item.name }}</div>
                <div class="book-address">{{ item.address | shortaddress}}</div>
              </li> 
            </ul>
          </div>
        </card>
      </div>

      <!--联系人-->
       <div class="data-content" v-if="showcontact && contacts.length > 0">
         <card class="account-card" padding="5px 5px" margin="15px 0px">
          <div class="card-content" slot="card-content">
            <div class="book-title">{{$t('Menu.Contacts')}}</div>
            <ul class="book-list">
              <li class="book-row" v-for="(item,index) in contacts" :key="index" @click="chose('contact',item)">
                <div class="book-name">{{ item.name }}</div>
                <div class="book-address">{{ item.address | shortaddress}}</div>
              </li> 
            </ul>
          </div>
        </card>
      </div>

      <!--我的地址-->
       <div class="data-content" v-if="showmyaddress && myaddresses.length > 0">
          <card class="account-card" padding="5px 5px" margin="15px 0px">
          <div class="card-content" slot="card-content">
            <div class="book-title">{{$t('MyAddress.Title')}}</div>
            <ul class="book-list">
              <li class="book-row" v-for="(item,index) in myaddresses" :key="index" @click="chose('myaddress',item)">
                <div class="book-name">{{ item.name }}</div>
                <div class="book-address">{{ item.address | shortaddress}}</div>
              </li> 
            </ul>
          </div>
        </card>
      </div>

      <!--没有数据-->
      <div class="data-content" v-if="!(showaccount && accounts.length > 0) && !(showcontact && contacts.length > 0) && !(showmyaddress && myaddresses.length > 0)">
        <card class="account-card" padding="5px 5px" margin="15px 0px">
          <div class="card-content" slot="card-content">
             {{$t('Error.NoData')}}
          </div>
        </card>
      </div>

    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters} from 'vuex'
import Card from '@/components/Card'


export default {
  data(){
    return {
      chosetype:null,
      choseitem: null,

    }
  },

  
  props: {
    title: {
      type: String,
      default: 'ContactBook.Title'
    },
    //显示哪些内容，account是账户，contact是联系人，myaddress是我的地址
    data: {
      type: Array,
      default: ()=>['account','contact','myaddress']
    },
    ok: {
      type: Function,
      default: ()=>{}
    },
    close: {
      type: Function,
      default: ()=>{}
    }

  },
  computed:{
    ...mapState({
      accounts: state => state.accounts.data || [],
      contacts: state => state.app.contacts || [],
      myaddresses: state => state.app.myaddresses||[],
    }),
    showaccount(){
      return this.data.indexOf('account')>=0
    },
    showcontact(){
      return this.data.indexOf('contact')>=0
    },
    showmyaddress(){
      return this.data.indexOf('myaddress')>=0
    },
    
  
  },
  methods: {
    chose(type,item){
      this.chosetype = type
      this.choseitem = item
      this.ok(type,item)
    }
  },
  components:{
    Card,

  }


}
</script>

<style lang="stylus" scoped>
@require '~@/stylus/color.styl'
.contact-book
  position: fixed
  top: 0
  bottom: 0
  left:0
  right:0
  color: $primarycolor.font
  background: $primarycolor.gray
  font-size: 16px
  z-index 99
  .bookbar
    background: $primarycolor.green
    height: 48px
    line-height: 48px
    display: flex
    .bar-close
    .bar-blank
      flex: 1
      text-align: center
    .bar-title
      flex: 8
      text-align: center
    .bar-close
      padding-top: 5px
  .book-content
    overflow-y:auto
    height: 100%
    padding: 10px 10px 70px 10px
.book-title
  width: 90%
  margin: 5px 5%
  font-size: 16px !important
  text-align: center
  padding-top: 10px
.book-list
  width: 100%
  padding: 5px 5%
  margin: 0px 0px
  .book-row
    padding-top: 5px
    padding-bottom: 5px
    border-bottom: 1px solid $secondarycolor.font
    &:last-child
      border-bottom: 0px
.book-address
  color: $secondarycolor.font
  font-size: 14px
  
</style>
