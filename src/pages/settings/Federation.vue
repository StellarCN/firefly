/**
 * Federation Server (Powered by fed.network)
 */
<template>
  <div class="page">
    <toolbar :title="$t(title)"
      :showmenuicon="showmenuicon"
      :showbackicon="showbackicon"
      @goback="back"
      />
    <div class="content">
      <card padding="10px 10px" class="mycard">
        <div class="card-content" slot="card-content">
          <v-alert type="error" :value="msg">
            {{msg}}
          </v-alert>

          <v-text-field
              v-if="currentState=='received' && !existFederation"
              name="federation"
              :label="$t('FederationName')"
              v-model="federation"
              dark
            ></v-text-field>
          <p v-else-if="currentState=='received' && existFederation">{{$t('FederationName.Address')}} 
            <span class="fed">{{existFederation}}</span>
            <span class="cancel_fed pa-1" @click="()=> confirmDlg = true">{{$t('unlink')}}</span>
            </p>
          <p v-else-if="currentState=='connecting'">{{$t('FederationName.Connecting')}}</p>
          <p v-else>{{$t('FederationName.ConnectionFailed')}}</p>
        </div>
      </card>
      <card padding="10px 10px" margin="10px 0 10px 0" class="mycard">
        <div class="card-content" slot="card-content">
          <p>{{$t('FederationName.Description')}}</p>
        </div>
      </card>
      <div class="btn-group">
        <v-btn class="btn-save" color="primary" primary @click="setName" v-if="currentState=='received' && !existFederation">{{$t('Save')}}</v-btn>
      </div>

    <v-dialog v-model="confirmDlg" max-width="95%" persistent>
      <div>
        <div class="card-content dlg-content">
          <div class="avatar-div textcenter">
            <v-avatar>
              <img src="../../assets/img/logo-red.png" />
            </v-avatar>
          </div>
          <div class="t2 skip-white pt-2 pb-4">{{$t('unlink')}}<span class="fed pl-2">{{existFederation}}</span></div>
          <div class="btns flex-row">
            <div class="flex1 skip-red textcenter" @click="doUnlink">{{$t('Button.OK')}}</div>
            <div class="flex1 skip-red textcenter" @click="confirmDlg = false">{{$t('Button.Cancel')}}</div>
          </div>
        </div>
      </div>
    </v-dialog>

    </div>
  </div>
</template>
<script>
import Toolbar from '@/components/Toolbar'
import Card from '@/components/Card'
import { mapState, mapActions } from 'vuex'
import { getAccountIdByAddress, getAddressByAccountId } from '@/api/federation'
import { FED_NETWORK_BIND_ADDRESS } from '@/api/gateways'

export default {
  data() {
    return {
      title: 'FederationName',
      showbackicon: true,
      showmenuicon: false,
      federation: null,
      existFederation: null,
      currentState: 'connecting',
      msg: null,
      working: false,
      confirmDlg: false,
    }
  },
  computed: {
    ...mapState({
      account: state => state.accounts.selectedAccount,
      accountData: state => state.accounts.accountData,
    }),
  },
  beforeMount() {
    // 查看用户是否已经有了 fed.network 用户名
    getAddressByAccountId(this.account.address, 'fed.network')
      .then(data => {
          console.log(data);
          this.existFederation = data.stellar_address
          this.currentState = 'received'
        }
      )
      .catch(error => {
        console.log(error);
        if (error.data) {
          this.msg = error.data.detail
          this.existFederation = null
          this.currentState = 'received'
        } else {
          this.currentState = 'error'
        }
      })
  },
  methods: {
    back() {
      this.$router.back()
    },
    setName() {
      if (this.working) return
      this.working = true
      let federationNameAddress = this.federation.split('*fed.network')[0]
      let searchAddress = federationNameAddress + '*fed.network'
      getAccountIdByAddress(searchAddress).then(
        data => {
          if (data.account_id) {
            this.working = false
            this.$toasted.error(this.$t('FederationName.Unavailable'))
          }
        }
      ).catch(
        error => {
          if (error.data && error.data.detail === 'free to use') {
            // 跳转到支付页面
            // TODO: 支付价格最好应该由 fed.network 提供 api 以防价格变动
            getAccountIdByAddress(FED_NETWORK_BIND_ADDRESS).then(
              data => {
                this.$toasted.show(this.$t('FederationName.Available'))
                let params = {
                  destination: data.account_id,
                  amount: "0.5",
                  memo_type: "Text",
                  memo: federationNameAddress
                }
                this.$router.push({name: 'SendAsset', params: params})
              }
            ).catch(error => {
              this.working = false
              this.$toasted.error(this.$t('FederationName.NetworkError'))
            })
          } else {
            this.working = false
            this.$toasted.error(this.$t('FederationName.Error'))
          }
        }
      )
    },
    doUnlink(){
      if(this.working)return;
      this.working = true
      getAccountIdByAddress(FED_NETWORK_BIND_ADDRESS)
        .then( data => {
          let params = {
            destination: data.account_id,
            amount: "1",
            memo_type: "None"
          }
          this.working = false
          this.$router.push({name: 'SendAsset', params: params})
        }).catch(error => {
          this.working = false
          this.$toasted.error(this.$t('FederationName.NetworkError'))
        })

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
    padding: 10px 10px
    .mycard
      .card-content
        .label
          color: $secondarycolor.font
          padding-top: 10px
          padding-bottom: 1px
        .value
          font-size: 18px
    .btn-group
      margin-top: 20px
      width: 100%
      .btn-save
        padding: 0px 0px
        margin: 0px 0px
        width: 100%
        height: 36px
.fed
  color: $primarycolor.green
.cancel_fed
  background: $primarycolor.red
  color: $primarycolor.font
.card-content
  padding: 20px 10px
.t1
  font-size: 20px
  padding-top: 5px
  padding-bottom: 5px
.t2
  font-size: 16px
.skip-red
  color: $primarycolor.red
.btns
  font-size: 16px
.dlg-green
  color: $primarycolor.green
.dlg-content
  background: $secondarycolor.gray
</style>
