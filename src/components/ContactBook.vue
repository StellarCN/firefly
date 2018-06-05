/**
 * 通讯录功能，显示所有的数据，让用户来选择，顶部是取消和确定按钮，可以给默认值
 * 1. 可以指定只显示账户、联系人、我的地址中的一种或几种
 * 2. 可以有默认值，都是指定name
 * 3. 通过取消或确定按钮来实现关闭和选中操作，如果选中了某一个，可以直接调用确定进行关闭
 */
<template>
  <div class="contact-book">
    <div v-if="isIos" class="ios-status ios-status-red">&nbsp;</div>
    <!--标题栏-->
    <div class="bookbar" >
      <div class="bar-blank">&nbsp;</div>
      <div class="bar-title">{{$t(title)}}</div>
      <div class="bar-close"  @click.stop="close">
        <i class="material-icons">&#xE5CD;</i>
      </div>
    </div>
    <div class="book-content">
      
        <div class="mt-2">
            <span @click="content_contact" v-bind:class="['content_menu_styleone', { content_menu_styletwo: isA }]">{{$t("Menu.Contacts")}}</span>
            <span @click="content_myaccount" v-bind:class="['content_menu_styleone', { content_menu_styletwo: isB }]">{{$t("MyAccount")}}</span>
            <span @click="content_myaddress" v-bind:class="['content_menu_styleone', { content_menu_styletwo: isC }]">{{$t("MemoBook.MyAddress")}}</span>
        </div>
        
        <div v-if="isA && contacts.length>0" class="contracts-list mt-2">
               <div class="contacts-row" v-for="contact in contacts" :key="contact.id">
                <v-layout class="mycontacts-li" row wrap  @click="chose('contact',contact)" >
                  <v-flex xs6 class="mycontacts-wrapper">
                    <div class="contact-name grey--text text--lighten-1">{{contact.name}}</div>
                  </v-flex>
                  <v-flex xs6 class="mycontacts-wrapper">
                    <div class="contact-address grey--text text--darken-1">{{contact.address|miniaddress}}</div>
                  </v-flex>
                </v-layout>
               </div>
        </div>
        <div v-else-if="isB && accounts.length>0" class="contracts-list mt-2">
               <div class="contacts-row" v-for="contact in accounts" :key="contact.id">
                <v-layout class="mycontacts-li" row wrap @click="chose('account',contact)">
                  <v-flex xs6 class="mycontacts-wrapper">
                    <div class="contact-name grey--text text--lighten-1">{{contact.name}}</div>
                  </v-flex>
                   <v-flex xs6 class="mycontacts-wrapper">
                    <div class="contact-address grey--text text--darken-1">{{contact.address|miniaddress}}</div>
                  </v-flex>
                </v-layout>
               </div>
        </div>
        <div v-else-if="isC && myaddresses.length>0" class="contracts-list mt-2">
               <div class="contacts-row" v-for="contact in myaddresses" :key="contact.id">
                <v-layout class="mycontacts-li" row wrap @click="chose('myaddress',contact)">
                  <v-flex xs6 class="mycontacts-wrapper">
                    <div class="contact-name grey--text text--lighten-1">{{contact.name}}</div>
                  </v-flex>
                  <v-flex xs6 class="mycontacts-wrapper">
                    <div class="contact-address grey--text text--darken-1">{{contact.address|miniaddress}}</div>
                  </v-flex>
                </v-layout>
               </div>
        </div>
        <div v-else class=" mt-2">
              <div class="contacts-row">
                <v-layout class="mycontacts-li" row wrap>
                  <v-flex xs6 class="mycontacts-wrapper">
                    <div class="contact-name grey--text text--lighten-1">{{$t("Error.NoData")}}</div>
                  </v-flex>
                </v-layout>
              </div>
        </div>
        
        
    </div>
  </div>
</template>

<script>
import Toolbar from "@/components/Toolbar";
import { mapState, mapActions, mapGetters } from "vuex";
import Card from "@/components/Card";

export default {
  data() {
    return {
      ContactBookTitle: "ContactBook.Title",
      chosetype: null,
      choseitem: null,
      isA: true,
      isB: false,
      isC: false
    };
  },

  props: {
    title: {
      type: String,
      default: "ContactBook.Title"
    },
    //显示哪些内容，account是账户，contact是联系人，myaddress是我的地址
    data: {
      type: Array,
      default: () => ["account", "contact", "myaddress"]
    },
    ok: {
      type: Function,
      default: () => {}
    },
    close: {
      type: Function,
      default: () => {}
    }
  },
  computed: {
    ...mapState({
      accounts: state => state.accounts.data || [],
      contacts: state => state.app.contacts || [],
      myaddresses: state => state.app.myaddresses || [],
      isIos: state => state.app.isIos,
    }),
    showaccount() {
      return this.data.indexOf("account") >= 0;
    },
    showcontact() {
      return this.data.indexOf("contact") >= 0;
    },
    showmyaddress() {
      return this.data.indexOf("myaddress") >= 0;
    }
  },
  methods: {
    chose(type, item) {
      this.chosetype = type;
      this.choseitem = item;
      this.ok(type, item);
    },
    back() {
      this.$emit('back')
    },
    content_contact() {
      if (this.isA == false) {
        this.isB = false;
        this.isC = false;
        this.isA = true;
      }
    },
    content_myaccount() {
      if (this.isB == false) {
        this.isC = false;
        this.isA = false;
        this.isB = true;
      }
    },
    content_myaddress() {
      if (this.isC == false) {
        this.isA = false;
        this.isB = false;
        this.isC = true;
      }
    }
  },
  components: {
    Card,
    Toolbar
  }
};
</script>

<style lang="stylus" scoped>
@require '~@/stylus/color.styl';

.ios-status-red
  background: $primarycolor.red!important

.contact-book {
  color: $primarycolor.font
  background: $primarycolor.gray
  font-size: 16px
  z-index: 99
  position: absolute
  top: 0
  left: 0
  bottom: 0
  right: 0
  overflow-y: auto

  .bookbar {
    background: $primarycolor.red;
    // background: $primarycolor.green
    height: 48px;
    line-height: 48px;
    display: flex;

    .bar-close, .bar-blank {
      flex: 1;
      text-align: center;
    }

    .bar-title {
      flex: 8;
      text-align: center;
    }

    .bar-close {
      padding-top: 5px;
    }
  }

  .book-content {
    padding: 10px 10px 70px 10px;
  }
}

.book-title {
  width: 90%;
  margin: 5px 5%;
  font-size: 16px !important;
  text-align: center;
  padding-top: 10px;
}

.book-list {
  width: 100%;
  padding: 5px 5%;
  margin: 0px 0px;

  .book-row {
    padding-top: 5px;
    padding-bottom: 5px;
    border-bottom: 1px solid $secondarycolor.font;

    &:last-child {
      border-bottom: 0px;
    }
  }
}

.book-address {
  color: $secondarycolor.font;
  font-size: 14px;
}

.content_menu_styleone {
  font-size: 16px;
  color: $secondarycolor.font;
  margin-left: 5px;
  padding-left:20px
  padding-right:20px
  margin-left:5px
  padding-bottom:3px
}

.content_menu_styletwo {
  border-bottom: 3px solid $primarycolor.red;
  color: $primarycolor.red;
  
}

.contacts-row {
  background-color: $primarycolor.gray;
}

.mycontacts-li {
  background-color: $secondarycolor.gray;
  border-radius: 5px;
  padding: 15px 15px;
  margin-top:1px
}

.contact-name {
  font-size: 16px;
  color: $primarycolor.font;
}
</style>
