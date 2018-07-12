import Vue from 'vue'
import Vuex from 'vuex'
import AccountsStore from './modules/AccountsStore'
import AppSettingStore from './modules/AppSettingStore'
import AccountStore from './modules/AccountStore'
import AssetStore from './modules/AssetStore'
import createPersist from './plugins/persistence'
import TradesStore from './modules/tradesStore'
import { APP_NAME, APP_VERSION, fetchSysDApps, fetchFundConfig} from '@/api/gateways'
import   MessageStore from "./modules/MessageStore"
var Base64 = require('js-base64').Base64


Vue.use(Vuex)

export const SHOW_TABBAR = 'SHOW_TABBAR'
export const HIDE_TABBAR = 'HIDE_TABBAR'
export const IS_FULL = 'IS_FULL'


const state = {
  showloading: false,
  error: null,
  isImportAccount: false,
  isCreateAccount: false,
  seed: null,
  mnemonic: null,
  mIndex: null,
  seedExtData: null,
  accountname: null,
  accountpassword: null,
  memo: null,
  iosstatusbarcolor: 'primary',
  onpause: false,//is app on pause
  showTabbar: true,//是否显示tabbar
  ifFull: false,//是否全屏
  dapps:[],//推荐应用
  autoFundConfig: null,//自动激活配置

}

const getters = {

}

export const LOAD_DAPPS = 'LOAD_DAPPS'
export const LOAD_FUNDCONFIG = 'LOAD_FUNDCONFIG'

export const IMPORT_ACCOUNT_CHANGE = 'IMPORT_ACCOUNT_CHANGE'
export const CREATE_ACCOUNT_CHANGE = 'CREATE_ACCOUNT_CHANGE'
export const BACK_TO_ACCOUNT = 'BACK_TO_ACCOUNT'
export const GLOBAL_ERROR = 'GLOBAL_ERROR'
export const SET_NEW_SEED = 'SET_NEW_SEED'
export const SET_CREATE_ACCOUNT_DATA = 'SET_CREATE_ACCOUNT_DATA'
export const SHOW_LOADING = 'SHOW_LOADING'
export const HIDEN_LOADING = 'HIDEN_LOADING'
export const CLEAN_GLOBAL_STATE = 'CLEAN_GLOBAL_STATE'
export const CHANGE_IOSSTATUSBAR_COLOR = 'CHANGE_IOSSTATUSBAR_COLOR'
export const ON_PAUSE = 'ON_PAUSE'
export const ON_RESUME = 'ON_RESUME'

const actions = {
  importAccountChange({commit}){
    commit(IMPORT_ACCOUNT_CHANGE)
  },
  createAccountChange({commit}){
    commit(CREATE_ACCOUNT_CHANGE)
  },
  backToAccount({commit}){
    commit(BACK_TO_ACCOUNT)
  },
  setNewSeed({commit},{seed,extdata,mnemonic,mIndex}){
    commit(SET_NEW_SEED,{seed,extdata, mnemonic, mIndex})
  },
  setCreateAccountData({commit}, {name,password,memo}){
    commit(SET_CREATE_ACCOUNT_DATA, {name,password, memo})
  },
  showLoading({commit}){
    commit(SHOW_LOADING)
  },
  hidenLoading({commit}){
    commit(HIDEN_LOADING)
  },
  cleanGlobalState({commit}){
    commit(CLEAN_GLOBAL_STATE)
  },
  onPause({commit}){
    commit(ON_PAUSE)
  },
  onResume({commit}){
    commit(ON_RESUME)
  },
  async loadDApps({commit}){
    let data = await fetchSysDApps()
    commit(LOAD_DAPPS, data.apps)
  },
  async loadFundConfig({commit}){
    let data = await fetchFundConfig()
    commit(LOAD_FUNDCONFIG, data)
  }


}

const mutations = {
  [IMPORT_ACCOUNT_CHANGE](state){
    state.isImportAccount = true
    state.isCreateAccount = false
  },
  [CREATE_ACCOUNT_CHANGE](state){
    state.isImportAccount = false
    state.isCreateAccount = true
  },
  [BACK_TO_ACCOUNT](state){
    state.isImportAccount = false
    state.isCreateAccount = false
  },
  [GLOBAL_ERROR](state,err){
    state.error = err
  },
  [SET_NEW_SEED](state,{seed,extdata, mnemonic, mIndex}){
    state.seed = seed
    state.seedExtData = extdata
    state.mnemonic = mnemonic
    state.mIndex = mIndex
  },
  [SET_CREATE_ACCOUNT_DATA](state,{name,password,memo}){
    state.accountname = name
    state.accountpassword = password
    state.memo = memo
  },
  [SHOW_LOADING](state){
    state.showloading = true
  },
  [HIDEN_LOADING](state){
    state.showloading = false
  },
  [CLEAN_GLOBAL_STATE](state){
    state.seed = null
    state.seedExtData= null
    state.accountname= null
    state.accountpassword= null
    state.memo= null
  },
  [CHANGE_IOSSTATUSBAR_COLOR](state,color){
    state.iosstatusbarcolor = color
  },
  [ON_PAUSE](state){
    state.onpause = true
  },
  [ON_RESUME](state){
    state.onpause = false
  },
  [SHOW_TABBAR](state){
    state.showTabbar = true
  },
  [HIDE_TABBAR](state){
    state.showTabbar = false
  },
  [IS_FULL](state, full){
    state.isFull = full
  },
  [LOAD_DAPPS](state,data){
    state.dapps = data
  },
  [LOAD_FUNDCONFIG](state, data){
    state.autoFundConfig = data
  }
  
}

const blocks = [
  'error',
  'seed',
  'seedExtData',
  'mnemonic',
  'mIndex',
  'accountname',
  'accountpassword',
  'password',
  'memo',
  'showTabbar',
  'autoFundConfig',
  'accounts.password',
  'accounts.error',
  'accounts.accountData.seed',
  'accounts.accountData.tradepairs',
  'account.account_not_funding',
  'account.payments.records',
  'account.transactions.records',
  'accounts.effects.records',
  'accounts.tradePairKLineData',
  'message.items',
  'asset.assets',
  'asset.selected',
  'trades.trades',
  'app.contacts',
  'app.enablePin',
  'app.horizon',
  'app.locale',
  'app.myaddresses',
  'app.pin'

]


let persistencePlugin = createPersist({
  namespace: APP_NAME + '-vuex-',
  initialState: {},
  serialize,
  deserialize,
  // never expire
  expires: 0,
  blocks
})
let plugins = [persistencePlugin]

const store = new Vuex.Store({
  state,
  getters,
  actions,
  mutations,
  modules: {
    accounts: AccountsStore,
    app: AppSettingStore,
    account: AccountStore,
    asset: AssetStore,
    trades: TradesStore,
    message:MessageStore
  },
  plugins

})

function serialize(value){
  // console.log(value)
  //return Base64.encode(JSON.stringify(value))
  let str=  JSON.stringify(value)
  // console.log('-------------------' + str.length)
  return str
}

function deserialize(value){
  //return JSON.parse(Base64.decode(value))
  return JSON.parse(value)
}


// if (module.hot) {
//   module.hot.accept([
//     './modules/AccountsStore',
//     './modules/AccountStore',
//     './modules/AppSettingStore',
//     './modules/AssetStore'
//   ], () => {
//     store.hotUpdate({
//       app: require('./modules/AppSettingStore'),
//       account: require('./modules/AccountStore'),
//       accounts: require('./modules/AccountsStore'),
//       asset: require('./modules/AssetStore')
//     })
//   })
// }

export default store
