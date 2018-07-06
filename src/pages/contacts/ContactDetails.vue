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
        <div class="contactdetails_card">
            <card  class="mycard ">
              <div class="card-content contactDetails_contactName_position" slot="card-content">
                    <span class="contactdetails_contactname">{{$t("ContactAdd.name")}}</span><!--名称  -->
                    <p class="contactdetails_contactnamevalue">{{contact.name}}</p><!--名称value  -->
              </div>
            <!-- </card> -->
            <!-- <card padding="0px" class="mycard"> -->
              <div class="card-content contact-info grey--text text--lighten-1" slot="card-content">
                    <span class="contactdetails_addresslabel">{{$t(addressLabel)}}</span>
                    <!-- </v-subheader> -->
                    <!-- 地址 -->
                  <p class="contactdetails_addresslabelvalue">{{contact.address}}</p><!--地址value -->
                  <div v-if='contact.memo' class="contactdetails_memolabelposition">
                    <v-subheader dark class="grey--text text--lighten-1 ">
                    <span class="contactdetails_memolabel">{{$t(memoLabel)}}</span></v-subheader><!--备注 -->
                    <span class="contactdetails_momolabelvalue">{{contact.memo}}</span><!-- 备注value-->
                  </div>
                  <div class="contactdetails_stellaraddressbarcode">
                      <div class="contactdetails_stellaraddressbarcode_text" >{{$t("StellarAddressBarCode")}}</div><!--恒星地址二维码 -->
                      <div class="contactdetails_stellaraddressbarcode_img"><qrcode :text="qrtext" :callback="qrcodecallback"/></div><!--恒星地址二维码图片 -->
                  </div>
              </div>
            </card>
            <div style="flex: 1;"></div>
            <v-footer class="contactdetails_vfooter">        
              <!-- <v-layout row  wrap> -->
                  <v-flex xs4>
                    <v-btn class='moddel' block flat dark :to="{name: 'ModifyContact', params:{id:contact.id}}" >
                      {{$t('Modify')}}
                    </v-btn><!--修改按钮 -->
                  </v-flex>
                  <v-flex xs8 class="contactdetails_sendposition">
                    <v-btn class='send'  block dark large @click="send">
                      {{$t(sendLabel)}}
                      </v-btn><!--发送按钮 -->
                  </v-flex>
              <!-- </v-layout>   -->
            </v-footer>
        </div> 
      </div>
   
  </div>
</template>

<script>
import { exportNameCard } from "../../api/qr";
import QRCode from "../../components/QRCode";
import Toolbar from "@/components/Toolbar";
import Card from "@/components/Card";
import { mapState, mapActions } from "vuex";
export default {
  data() {
    return {
      title: "Menu.Contacts",
      detailLabel: "ContactAdd.details",
      addressLabel: "ContactAdd.address",
      memoLabel: "ContactAdd.memo",
      sendLabel: "Send",
      showbackicon: true,
      showmenuicon: false,
      avatarSize: "56px"
    };
  },
  computed: {
    qrtext() {
      //类似于stargazer的格式
      return exportNameCard(this.contact.address);
      //return JSON.stringify(exportNameCard(this.account))
    },
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
      allcontacts: state => state.app.contacts,
      islogin: state => (state.accounts.accountData.seed ? true : false)
    }),
    contact() {
      const id = parseInt(this.$route.params.id);
      return this.allcontacts.filter(function(c) {
        return c.id === id;
      })[0];
    }
  },
  mounted() {
    console.log(this.contact.memo)
  },
  methods: {
    qrcodecallback(img) {
      this.qrcodebase64 = img;
    },
    ...mapActions(["deleteContact"]),
    back() {
      this.$router.back();
    },
    send() {
      //跳转到添加联系人菜单
      console.log("ready to send asset to this contact");
      if (!this.islogin) {
        //this.$toasted.error(this.$t('Error.NoPassword'))
        this.$refs.toolbar.showPasswordLogin();
        return;
      }
      this.$router.push({
        name: "SendAsset",
        params: {
          destination: this.contact.address,
          memo_type: this.contact.memotype,
          memo: this.contact.memo
        }
      });
    },
    deleteThisContact() {
      //console.log('delete this contact ' + this.contact.id)
      var id_temp = this.contact.id;
      //console.log('===============================================id ===== ' + id_temp)
      this.deleteContact({ id_temp, contact: this.contact });
      this.$router.push({ name: "ContactsList" });
    }
  },
  components: {
    Toolbar,
    Card,
    qrcode: QRCode
  }
};
</script>


<style lang="stylus" scoped>
@require '~@/stylus/color.styl';

.page {
  background: $primarycolor.gray;
  color: $primarycolor.font;
  font-size: 16px;

  .content {
    display: flex;
    flex-direction: column;
    // min-height calc(100vh - 48px)
    background-color: $primarycolor.gray;

    .contactdetails_card {
      background-color: $secondarycolor.gray;
      border-radius: 5px;
     
    }

    .mycard {
      .contact-name {
        min-width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
        text-align: center;
        min-height: 110px;

        .avatar {
          font-size: 1.2em;
          color: #21ce90;
        }
      }

      .contact-info {
        padding: 0 6px;
        font-size: 16px;
        word-wrap: wrap;
        word-break: break-all;

        .subheader {
          padding: 0;
          height: 20px;
        }
      }
    }
  }
}

.footer {
  width: 100%;
  height: 100%;
  background: transparent;
}

.contactdetails_vfooter
  background-color:$primarycolor.gray
  width:100%
  margin:0px 0px
  position: absolute
  left: 0
  bottom: 8px
  right: 0
  padding: 8px 8px

.send {
  background-color: #21ce90 !important;
  
}

.moddel {
  color: #21ce90 !important;
}

.contactdetails_sendposition
  margin-right:0px
  
  
.contactdetails_memolabelposition
  margin-top:-5px
  height:20px
  

.contactdetails_addresslabel
  padding-left:5px
  color:$primarycolor.green
  padding-top:0px
  height:10px
.contactdetails_memolabel
  padding-left:5px
  color:$primarycolor.green
  padding-top:0px

.contactdetails_addresslabelvalue
  padding-left:5px
  margin-top:5px
.contactdetails_momolabelvalue
  padding-left:5px  
  
  
  

.contactdetails_contactname
  position:relative
  padding-left:13px
  padding-top:20px 
  color:$primarycolor.green
.contactdetails_contactnamevalue
  position:absolute
  margin-left:12px
  margin-top:5px
  
  
.contactdetails_stellaraddressbarcode
  text-align:center
  color:$primarycolor.green
  margin-top:40px
  padding-bottom:40px
.contactdetails_stellaraddressbarcode_text
  padding-bottom:20px

.contactDetails_contactName_position
  height:65px
  padding-top:10px
</style>

