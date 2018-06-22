// 钱包账户地址
import { createAccount as createAccountApi, readAccounts,
    saveAccounts, readAccountData, saveAccountData,deleteAccountData,
    saveTradePairData,readTradePairData } from '@/api/storage'
import { getDefaultTradePairs,getDefaultSysTradePairAndStat, getTradePairStat } from '@/api/gateways'
import { getOrderbook } from '@/api/orderbook'
import { getAsset, assetKey } from '@/api/assets'
import { fetchEffects } from '@/api/effects'
import { queryOffer } from '@/api/offer'
import sjcl from 'sjcl'

export const LOAD_ACCOUNTS = 'LOAD_ACCOUNTS'
export const CHANGE_ACCOUNT = 'CHANGE_ACCOUNT'
export const CREATE_ACCOUNT = 'CREATE_ACCOUNT'
export const LOAD_ACCOUNT_DATA = 'LOAD_ACCOUNT_DATA'
export const CHANGE_ACCOUNT_NO_PASSWORD = 'CHANGE_ACCOUNT_NO_PASSWORD'
export const CLEAN_ACCOUNT_DATA = 'CLEAN_ACCOUNT_DATA'

export const SELECT_TRADE_PAIR = 'SELECT_TRADE_PAIR'
export const QUERY_ORDERBOOK = 'QUERY_ORDERBOOK'
export const QUERY_MY_OFFERS = 'QUERY_MY_OFFERS'
export const ORDERBOOK_STREAM_HANDLER = 'ORDERBOOK_STREAM_HANDLER'
export const CONTACT_ID_INCREMENT = 'CONTACT_ID_INCREMENT'
export const RESET_PASSWORD = 'RESET_PASSWORD'
export const QUERY_MY_EFFECTS = 'QUERY_MY_EFFECTS'
export const CLEAN_MY_EFFECTS = 'CLEAN_MY_EFFECTS'
export const CHANGE_CURRENT_HISTORY_COMPONENT = 'CHANGE_CURRENT_HISTORY_COMPONENT'
export const SORT_TRADEPAIRS = 'SORT_TRADEPAIRS'

export const REMOVE_TRADEPAIR_KLINE_DATA = 'REMOVE_TRADEPAIR_KLINE_DATA'
export const SET_TRADEPAIR_KLINE_LASTTRADE = 'SET_TRADEPAIR_KLINE_LASTTRADE'
export const SET_TRADEPAIR_KLINE_TRADEAGGREGATION = 'SET_TRADEPAIR_KLINE_TRADEAGGREGATION'
export const SET_TRADEPAIR_KLINE_7DAY_TRADEAGGREGATION = 'SET_TRADEPAIR_KLINE_7DAY_TRADEAGGREGATION'

//查询默认交易对以及交易数据
export const SET_DEFAULT_TRADEPAIR_AND_STAT = 'SET_DEFAULT_TRADEPAIR_AND_STAT'
//根据条件查询某个交易对的数据
export const SET_TRADEPAIR_AND_STAT = 'SET_TRADEPAIR_AND_STAT'
export const SET_TRADEPAIR_UPDATETIME  = 'SET_TRADEPAIR_UPDATETIME'

export const LOAD_TRADEPAIRS = 'LOAD_TRADEPAIRS'

// 状态字段
const state = {
  error:undefined,
  //当前所有的账户,保存到文件中
  data: [],
  // 当前操作的账户序号，保存到文件中
  selected:-1,
  // 当前操作的账户信息
  selectedAccount:{
    name:null,// 钱包名称
    address: null,// 钱包地址
    federationAddress: null,//联邦地址
    inflationAddress: null,//通账地址
    memo: null // 钱包备注
  },
  password: null,
  //当前选中账户的数据信息（需要个人密码才能解密查看）,需要持久化
  accountData: {
    mnemonic:null,//可能是采用助记词生成的
    mIndex: 0,//默认的助记词哪个索引生成的
    // 私钥地址
    seed: null,
    //tradepairs:[]//交易对，新建账户时将给赋默认值（gateways.js）
  },
  tradepairs: {
    sys: [], // 系统默认交易对
    custom: [],//自定义交易对
  },
  lastUpdateTradePairStatTime: null,
  // defaultTradePairs:{},//默认的交易对
  tradePairsStat:{},//所有交易对的统计数据
  //当前选中的tradepair
  selectedTradePair:{
    index: -1,
    custom: 'sys',
    tradepair:{},
    bids:[],//买单
    asks:[],//卖单
    my: []//我的委单
  },
  effects:{
    records: [],
    nextPage: null
  },
  //交易对的K线数据（针对短期的数据）
  tradePairKLineData:{},
  currentHistoryComponent: 'offer' // 记住用户的历史页面 not perfect but works
}

const BLANK_ACCOUNT = {seed: null}

const actions = {
  cleanAccountData({commit}){
    commit(CLEAN_ACCOUNT_DATA)
  },
  // 加载所有账户
  async loadAccounts ({ commit }) {
    commit(LOAD_ACCOUNTS, await readAccounts())
  },
  async saveAccountsAction({commit,state}){
    let accounts = {data: state.data, selected: state.selected}
    await saveAccounts(accounts)
  },
  // 输入密码切换账户
  // @param index 序号
  // @param address 地址
  // @param password 密码
  async changeAccount({dispatch, commit, state}, {index, address, password}){
    commit(CLEAN_ACCOUNT_DATA)
    let data = await readAccountData(address,password)
    commit(CHANGE_ACCOUNT, { index, address, password, accountdata:data} )
    dispatch('saveAccountsAction')
    dispatch('cleanAccount')
    dispatch('getAccountInfo', address)
  },

  /**
   * 校验密码是否正确
   */
  async checkAccountPWD({dispatch, commit, state}, {index, address, password}){
    let data = await readAccountData(address,password)
    commit(CHANGE_ACCOUNT, { index, address, password, accountdata:data} )
    //dispatch('getAccountInfo', address)
  },
  

  /**
   * 无密码切换账户（只能查询）
   * @param {Object} param0  vuex参数
   * @param {int} index 切换的账户序号
   * @param {String} address 账户地址
   */
  async changeAccountNoPassword({dispatch, commit, state}, {index, address}){
    commit(CLEAN_ACCOUNT_DATA)
    commit(CHANGE_ACCOUNT_NO_PASSWORD, { index, address} )
    dispatch('saveAccountsAction')
    dispatch('getAccountInfo',address)
  },
  // 创建账户
  async createAccount({dispatch,commit,state}, {name,address,seed, password, memo}){
    let newaccount = {name,address,memo}
    // let tradepairs = getDefaultTradePairs()
    let newaccountdata = Object.assign({},BLANK_ACCOUNT, {seed:seed })
    let data = [...state.data,newaccount]
    let accounts = {data: data, selected: (data.length-1) }
    console.log('---create account')
    console.log(data)
    console.log(accounts)
    console.log(newaccountdata)
    await createAccountApi(accounts,address,newaccountdata, password)
    commit(CREATE_ACCOUNT, { accounts, password, newaccountdata} )
    dispatch('cleanAccount')
  },
  //使用助记词创建账户
  async createAccountByMnemonic({dispatch, commit, state}, {name, address, seed, mnemonic, mIndex, password, memo}){
    let newaccount = {name,address,memo}
    // let tradepairs = getDefaultTradePairs()
    let newaccountdata = Object.assign({},BLANK_ACCOUNT, {mnemonic, mIndex, seed })
    let data = [...state.data,newaccount]
    let accounts = {data: data, selected: (data.length-1) }
    console.log('---create account')
    console.log(data)
    console.log(accounts)
    console.log(newaccountdata)
    await createAccountApi(accounts,address,newaccountdata, password)
    commit(CREATE_ACCOUNT, { accounts, password, newaccountdata} )
    dispatch('cleanAccount')
  },
  //覆盖账户
  async coverAccount({dispatch,commit,state},{name,address,seed,mnemonic,mIndex, password, memo}){
    // let tradepairs = getDefaultTradePairs()
    let newaccountdata = Object.assign({},BLANK_ACCOUNT, {seed, mnemonic, mIndex})
    await saveAccountData(address,newaccountdata,password)
    let index = -1
    let account = null
    for(var i=0,n=state.data.length;i<n;i++){
      if(state.data[i].address === address){
        index = i
        account = state.data[i]
        break
      }
    }
    account.name = name
    account.memo = memo
    dispatch('updateAccount',{index,account})
    dispatch('changeAccount',{index, address, password})
  },
  // 修改账户
  async updateAccount({dispatch, commit, state}, {index, account}){
    let data = [...state.data]
    data[index] = account
    let accounts = { data: data, selected: state.selected }
    await saveAccounts(accounts)
    commit(LOAD_ACCOUNTS, accounts)
    // dispatch('cleanAccount')
  },
  /**
   * 重置账户密码
   */
  async resetAccountPwd({dispatch, commit, state}, {index, account, password, newpassword}){
    let address = account.address
    let data = await readAccountData(address,password)
    await saveAccountData(address,data,newpassword)
    commit(RESET_PASSWORD, {index, newpassword})
  },
  // 删除账户
  async deleteAccount({dispatch, commit, state}, {index, account}){
    let statedata = [...state.data]
    let data = statedata.splice(index,1)
    let selected = state.selected
    if(index === selected ) {
      selected = 0 //默认查询第1个
    }else if(index < selected){
      selected--
    }
    let accounts = { data: statedata, selected: selected }
    await saveAccounts(accounts)
    await deleteAccountData(account.address)
    commit(CLEAN_ACCOUNT_DATA)
    commit(LOAD_ACCOUNTS, accounts)
    //dispatch('cleanAccount')
  },

  //删除交易对,custom是否为自定义的交易对
  async deleteTradePair({dispatch,commit,state},{custom, index, tradepair}){
    let data = Object.assign({}, state.tradepairs )
    if(custom){//自定义数据
      data.custom.splice(index,1)
    }else{//非自定义数据
      data.sys.splice(index,1)
    }
    await saveTradePairData(data)
    commit(LOAD_TRADEPAIRS,data)
  },

  //添加交易对,必然是自定义
  async addTradePair({dispatch,commit,state},tradepair){
    let pairs = [...state.tradepairs.custom]
    pairs.push(tradepair)
    let data = Object.assign({}, state.tradepairs, { custom: pairs})
    await saveTradePairData(data)
    commit(LOAD_TRADEPAIRS,data)
  },

  //交换交易对
  async switchTradePair({dispatch,commit,state},{custom, index,tradepair}){
    let pairs = Object.assign({}, state.tradepairs)
    if(custom){
      pairs.custom[index] = tradepair
    }else{
      // pairs.sys[index] = tradepair
      //index不正确，重新查询
      let tempPair = null
      let key = tradepair.key
      if(!key){
        key = assetKey(tradepair.to, tradepair.from)
        tradepair.key = key
      }
      for(let i=0,n=pairs.sys.length;i<n;i++){
        tempPair = pairs.sys[i]
        if(tempPair.key === key){
          index = i
          break;
        }
      }
      pairs.sys[index] = tradepair
    }
    await saveTradePairData(pairs)
    commit(LOAD_TRADEPAIRS,pairs)
    // commit(LOAD_ACCOUNT_DATA,pairs)
    
  },
  // 选中某个交易对
  selectTradePair({commit,state},{custom, index,tradepair}){
    console.log('----selecte trade pair ---- ' + custom + ',index:' + index)
    console.log(tradepair)
    if(custom){
      commit(SELECT_TRADE_PAIR,{custom, index, tradepair})
    }else{
      let pairs = Object.assign({}, state.tradepairs)
      let tempPair = null
      let key = tradepair.key
      if(!key){
        key = assetKey(tradepair.to, tradepair.from)
        tradepair.key = key
      }
      console.log(key)
      console.log(pairs.sys)
      for(let i=0,n=pairs.sys.length;i<n;i++){
        tempPair = pairs.sys[i]
        if(tempPair.key === key){
          index = i
          break;
        }
      }
      commit(SELECT_TRADE_PAIR,{custom, index, tradepair})
    }

  },

  //保存默认交易对
  async saveDefaultTradePairs({commit,state}){
    let sys = await getDefaultTradePairs()
    let custom = state.tradepairs.custom || []
    let pairs = { sys, custom}
    await saveTradePairData(pairs)
    // pairs = readTradePairData()
    commit(LOAD_TRADEPAIRS,pairs)
  },

  //查询默认交易对和统计数据
  async saveDefaultTradePairsStat({commit, state}){
    let response = await getDefaultSysTradePairAndStat()
    //分离交易对和数据
    commit(SET_DEFAULT_TRADEPAIR_AND_STAT, response.data || {})
  },

  async saveTradePairStat({commit, state}, {base, counter}){
    let response = await getTradePairStat(base,counter)
    commit(SET_TRADEPAIR_AND_STAT, response.data||{})
  },


  //查询当前的盘面
  async queryOrderBook({commit,state}){
    let buyAsset = getAsset(state.selectedTradePair.tradepair.to.code,
        state.selectedTradePair.tradepair.to.issuer)
    let sellAsset = getAsset(state.selectedTradePair.tradepair.from.code,
        state.selectedTradePair.tradepair.from.issuer)
    let records = await getOrderbook(sellAsset,buyAsset)
    // console.log(`---------------query order book : ${records}`)
    commit(QUERY_ORDERBOOK,records)
  },

  //交换当前盘面资产
  async switchSelectedTradePair({dispatch,commit,state}){
    let tradepair = {from: state.selectedTradePair.tradepair.to, to: state.selectedTradePair.tradepair.from}
    let index = state.selectedTradePair.index
    let custom = state.selectedTradePair.custom
    commit(SELECT_TRADE_PAIR,{custom, index, tradepair})
    await dispatch('queryOrderBook')
    await dispatch('queryMyOffers')
  },

  //查询我的委单（所有的，需要手动过滤）
  async queryMyOffers({dispatch,commit,state}){
    let records = await queryOffer(state.selectedAccount.address)
    //如果数据不相同，则更新当前界面的account
    try{
      let originData = state.selectedTradePair.my
      if(Array.isArray(originData) || !originData.records){
        await dispatch('getAccountInfo', state.selectedAccount.address)
      }else{
        let d1 = JSON.stringify(originData.records)
        let d2 = JSON.stringify(records.records)
        // console.log('---hash---,d1:'+d1+"....d2:"+d2 )
        let s1 = sjcl.hash.sha256.hash(d1)
        let s2 = sjcl.hash.sha256.hash(d2)
        // console.log('---hash---,s1:'+s1+"....s2:"+s2 )
        if(s1!==s2){
          await dispatch('getAccountInfo', state.selectedAccount.address)
        }
      }
    }catch(err){
      console.error(err)
    }

    commit(QUERY_MY_OFFERS,records)
  },
  //盘面监听得到数据后处理
  orderBookStreamHandler({commit,state}, data){
    commit(ORDERBOOK_STREAM_HANDLER, data)
  },





  // TODO: 分页获取我的交易记录，获取的数据是未处理的，需要进一步处理，只保留 type 为 trade 的
  async queryMyEffects({commit,state}, nextPage=false) {
    let queryData;
    let recordPerPage = 20;
    if (!nextPage) {
      commit(CLEAN_MY_EFFECTS)
      queryData = await fetchEffects(state.selectedAccount.address, 'desc', recordPerPage)
    } else {
      if (!state.effects.nextPage) {
        throw new Error('No nextPage, please check state.accounts.effects.nextPage first.');
      }
      queryData = await state.effects.nextPage()
    }
    if (queryData.records.length < recordPerPage) {
      queryData.next = null
    }
    commit(QUERY_MY_EFFECTS, queryData)
  },
  changeCurrentHistoryComponent({commit,state}, current) {
    commit(CHANGE_CURRENT_HISTORY_COMPONENT, current)
  }
}

const mutations = {
  [LOAD_ACCOUNTS](state, accounts){
    state.data = accounts.data
    state.selected = accounts.selected
    let account = accounts.data[accounts.selected]
    if(account){
      state.selectedAccount = account
    }else{
      state.selectedAccount = {name: null , address: null, memo: null}
    }
  },
  [CHANGE_ACCOUNT_NO_PASSWORD](state, { index, address}){
    state.selected = index
    state.password = null
    state.selectedAccount = state.data[index]
    state.accountData = Object.assign({},BLANK_ACCOUNT)
  },
  [CHANGE_ACCOUNT](state, {index, address, password, accountdata}){
    // 当前选择的账户信息要调整
    state.selected = index
    state.password = password
    state.selectedAccount = state.data[index]
    state.accountData = accountdata
  },
  [CREATE_ACCOUNT](state, { accounts, password, newaccountdata}){
    console.log('create account mutation')
    console.log(accounts)
    console.log(password)
    console.log(newaccountdata)
    state.data = accounts.data
    state.selected = accounts.data.length - 1
    state.selectedAccount = accounts.data[state.selected]
    state.password = password
    state.accountData = newaccountdata
  },
  [LOAD_ACCOUNT_DATA](state,accountData){
    state.accountData = accountData
  },
  [CLEAN_ACCOUNT_DATA](state){
    state.accountData = {
        seed: null,
        contacts:[],
        tradepairs:[]
      }
      state.selectedTradePair = {
        index: -1,
        custom: false,
        tradepair:{},
        bids:[],//买单
        asks:[],//卖单
        my: []//我的委单
      }
  },
  // custom 是否为自定义交易对
  [SELECT_TRADE_PAIR](state, { custom = false, index, tradepair}){
    state.selectedTradePair = {
      index,
      custom,
      tradepair,
      bids:[],
      asks:[],
      my: []
    }
  },
  [QUERY_ORDERBOOK](state,records){
    state.selectedTradePair.bids = records.bids
    state.selectedTradePair.asks = records.asks
  },
  [QUERY_MY_OFFERS](state,records){
    state.selectedTradePair.my = records
  },

  [ORDERBOOK_STREAM_HANDLER](state,data){
    console.log('-------------------------state ORDERBOOK_STREAM_HANDLER')
    console.log(data)
  },
  [RESET_PASSWORD](state,{index,newpassword}){
    if(index === state.selected){
      state.password = newpassword;
    }
  },
  [QUERY_MY_EFFECTS](state, data) {
    state.effects.records.push(...data.records)
    state.effects.nextPage = data.next
  },
  [CLEAN_MY_EFFECTS](state) {
    state.effects.records = []
    state.effects.nextPage = null
  },
  [CHANGE_CURRENT_HISTORY_COMPONENT](state, data) {
    state.currentHistoryComponent = data
  },
  [SORT_TRADEPAIRS](state,pairs){
    state.accountData.tradepairs = pairs
  },
  [SET_TRADEPAIR_KLINE_LASTTRADE](state,{index,date,data}){
    let _data = state.tradePairKLineData[index]
    if(_data){
      _data = Object.assign(_data, {date, lastTrade: data})
    }else{
      _data = {date, lastTrade: data}
    }
    state.tradePairKLineData[index] = _data
  },
  [SET_TRADEPAIR_KLINE_TRADEAGGREGATION](state, {index, date, data}){
    let _data = state.tradePairKLineData[index]
    if(_data){
      _data = Object.assign(_data, {date, tradeAggregation: data})
    }else{
      _data = {date, tradeAggregation: data}
    }
    state.tradePairKLineData[index] = _data
  },
  [SET_TRADEPAIR_KLINE_7DAY_TRADEAGGREGATION](state, {index,date, data}){
    let _data = state.tradePairKLineData[index]
    if(_data){
      _data = Object.assign(_data, {date, sevenDayTradeAggregation: data})
    }else{
      _data = {date, sevenDayTradeAggregation: data}
    }
    state.tradePairKLineData[index] = _data
  },
  [REMOVE_TRADEPAIR_KLINE_DATA](state, index){
    let obj = Object.assign({}, state.tradePairKLineData)
    delete obj[index]
    state.tradePairKLineData = obj
  },
  [LOAD_TRADEPAIRS](state, data){
    state.tradepairs = data;
  },
  [SET_DEFAULT_TRADEPAIR_AND_STAT](state, data){
    //更新分组
    //更新统计数据
    let group = {}
    let allpairs = []
    let stats = {}
    for(let key in data){
      console.log(key + ',' + data[key])
      let arr = data[key]
      let pairs = []
      for(let i=0,n=arr.length;i<n;i++){
        let item = arr[i]
        let k = assetKey(item.base_asset, item.counter_asset)
        let d = {from: item.base_asset, to: item.counter_asset, k}
        pairs.push(d)
        allpairs.push(d)
        stats[k] = item.stat
      }
      group[key] = pairs
    }
    state.defaultTradePairs = group
    state.tradepairs.sys = allpairs
    state.tradePairsStat = Object.assign({}, state.tradePairsStat, stats)
  },

  [SET_TRADEPAIR_AND_STAT](state, data){
    let stats = {}
    for(let key in data){
      let arr = data[key]
      for(let i=0,n=arr.length;i<n;i++){
        let item = arr[i]
        let k = assetKey(item.base_asset, item.counter_asset)
        stats[k] = item.stat
      }
    }
    state.tradePairsStat = Object.assign({}, state.tradePairsStat, stats)
  },
  [SET_TRADEPAIR_UPDATETIME](state, date){
    state.lastUpdateTradePairStatTime = date
  }

}


export default {
  state,
  actions,
  mutations
}
